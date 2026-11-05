"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import type { District } from "@/lib/districts";
import { MapPin, Palmtree, UtensilsCrossed, Palette, X } from "lucide-react";

/* ─── palette ─── */

const R: Record<string, { hue: string; g: string; bg: string; b: string }> = {
  south:   { hue: "#FF6B6B", g: "0 0 30px rgba(255,107,107,0.4), 0 0 80px rgba(255,107,107,0.12)", bg: "rgba(255,107,107,0.06)", b: "rgba(255,107,107,0.3)" },
  central: { hue: "#4DABF7", g: "0 0 30px rgba(77,171,247,0.4), 0 0 80px rgba(77,171,247,0.12)", bg: "rgba(77,171,247,0.06)", b: "rgba(77,171,247,0.3)" },
  north:   { hue: "#DA77F2", g: "0 0 30px rgba(218,119,242,0.4), 0 0 80px rgba(218,119,242,0.12)", bg: "rgba(218,119,242,0.06)", b: "rgba(218,119,242,0.3)" },
};

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  sub_location: MapPin, tourist: Palmtree, food: UtensilsCrossed, culture: Palette,
};
const C: Record<string, { hue: string; g: string; bg: string; b: string; label: string }> = {
  sub_location: { hue: "#38BDF8", label: "Hub",     g: "0 0 20px rgba(56,189,248,0.35)",  bg: "rgba(56,189,248,0.07)", b: "rgba(56,189,248,0.3)" },
  tourist:      { hue: "#FBBF24", label: "Spot",    g: "0 0 20px rgba(251,191,36,0.35)",  bg: "rgba(251,191,36,0.07)", b: "rgba(251,191,36,0.3)" },
  food:         { hue: "#FB7185", label: "Food",    g: "0 0 20px rgba(251,113,133,0.35)", bg: "rgba(251,113,133,0.07)", b: "rgba(251,113,133,0.3)" },
  culture:      { hue: "#C084FC", label: "Culture", g: "0 0 20px rgba(192,132,252,0.35)", bg: "rgba(192,132,252,0.07)", b: "rgba(192,132,252,0.3)" },
};

/* ─── adjacency — geographically neighboring districts ─── */

const ADJACENCY: Record<string, string[]> = {
  thiruvananthapuram: ["kollam"],
  kollam: ["thiruvananthapuram", "pathanamthitta", "alappuzha"],
  pathanamthitta: ["kollam", "alappuzha", "kottayam", "idukki"],
  alappuzha: ["kollam", "pathanamthitta", "kottayam", "ernakulam"],
  kottayam: ["alappuzha", "pathanamthitta", "idukki", "ernakulam"],
  idukki: ["pathanamthitta", "kottayam", "ernakulam", "thrissur"],
  ernakulam: ["alappuzha", "kottayam", "idukki", "thrissur"],
  thrissur: ["ernakulam", "idukki", "palakkad", "malappuram"],
  palakkad: ["thrissur", "malappuram"],
  malappuram: ["thrissur", "palakkad", "kozhikode"],
  kozhikode: ["malappuram", "wayanad", "kannur"],
  wayanad: ["kozhikode", "kannur"],
  kannur: ["kozhikode", "wayanad", "kasaragod"],
  kasaragod: ["kannur"],
};

/* ─── children ─── */

interface Child { id: string; label: string; sub?: string; type: string; desc?: string; hl?: string[]; issues?: number }

function getChildren(d: District): Child[] {
  const o: Child[] = [];
  d.subLocations.forEach((s) => o.push({ id: `s-${s.id}`, label: s.name, sub: s.malayalamName, type: "sub_location", desc: s.tagline, hl: s.highlights, issues: s.activeIssuesCount }));
  d.touristSpots.forEach((t) => o.push({ id: `t-${t.name}`, label: t.name, type: "tourist", desc: t.description }));
  d.signatureFood.forEach((f) => o.push({ id: `f-${f}`, label: f, type: "food" }));
  d.culturalIcons.forEach((c) => o.push({ id: `c-${c}`, label: c, type: "culture" }));
  return o;
}

function contentCount(d: District): number {
  return d.subLocations.length + d.touristSpots.length + d.signatureFood.length + d.culturalIcons.length;
}

/* ─── hooks ─── */

function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setR(mq.matches);
    const h = (e: MediaQueryListEvent) => setR(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return r;
}

/* ─── particle canvas ─── */

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number; color: string; alpha: number;
}

interface FlowParticle {
  progress: number; speed: number;
  x1: number; y1: number; x2: number; y2: number;
  color: string; size: number;
}

function useParticleCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  width: number, height: number,
  nodes: { x: number; y: number; region: string }[],
  cx: number, cy: number,
  noMotion: boolean, entered: boolean, isOpen: boolean,
) {
  const particlesRef = useRef<Particle[]>([]);
  const flowRef = useRef<FlowParticle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (noMotion || !entered || width < 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width * (window.devicePixelRatio || 1);
    canvas.height = height * (window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

    // seed ambient particles
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 40; i++) {
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15 - 0.05,
          life: Math.random() * 300,
          maxLife: 200 + Math.random() * 300,
          size: 0.5 + Math.random() * 1.5,
          color: ["#E8A020", "#1B6B3A", "#F9F5EE"][Math.floor(Math.random() * 3)],
          alpha: 0,
        });
      }
    }

    // seed flow particles along connections
    if (flowRef.current.length === 0 && !isOpen) {
      nodes.forEach((n) => {
        const color = R[n.region]?.hue ?? "#F9F5EE";
        for (let j = 0; j < 3; j++) {
          flowRef.current.push({
            progress: Math.random(),
            speed: 0.001 + Math.random() * 0.002,
            x1: cx, y1: cy, x2: n.x, y2: n.y,
            color, size: 1 + Math.random(),
          });
        }
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // ambient particles
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        const t = p.life / p.maxLife;
        p.alpha = t < 0.1 ? t / 0.1 : t > 0.8 ? (1 - t) / 0.2 : 1;
        p.alpha *= 0.25;

        if (p.life > p.maxLife) {
          p.x = Math.random() * width;
          p.y = height + 5;
          p.life = 0;
          p.maxLife = 200 + Math.random() * 300;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      }

      // flow particles along lines
      if (!isOpen) {
        for (const f of flowRef.current) {
          f.progress += f.speed;
          if (f.progress > 1) f.progress = 0;

          const x = f.x1 + (f.x2 - f.x1) * f.progress;
          const y = f.y1 + (f.y2 - f.y1) * f.progress;
          const alpha = f.progress < 0.1 ? f.progress / 0.1 : f.progress > 0.85 ? (1 - f.progress) / 0.15 : 1;

          ctx.beginPath();
          ctx.arc(x, y, f.size, 0, Math.PI * 2);
          ctx.fillStyle = f.color;
          ctx.globalAlpha = alpha * 0.6;
          ctx.fill();

          // glow
          ctx.beginPath();
          ctx.arc(x, y, f.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = f.color;
          ctx.globalAlpha = alpha * 0.08;
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [canvasRef, width, height, nodes, cx, cy, noMotion, entered, isOpen]);

  // update flow particles when nodes change (open/close)
  useEffect(() => {
    if (isOpen) {
      flowRef.current = [];
    } else if (flowRef.current.length === 0 && nodes.length > 0) {
      nodes.forEach((n) => {
        const color = R[n.region]?.hue ?? "#F9F5EE";
        for (let j = 0; j < 3; j++) {
          flowRef.current.push({
            progress: Math.random(),
            speed: 0.001 + Math.random() * 0.002,
            x1: cx, y1: cy, x2: n.x, y2: n.y,
            color, size: 1 + Math.random(),
          });
        }
      });
    }
  }, [isOpen, nodes, cx, cy]);
}

/* ─── mouse parallax ─── */

function useMouseParallax(containerRef: React.RefObject<HTMLDivElement | null>, noMotion: boolean) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (noMotion) return;
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width - 0.5;
      const my = (e.clientY - rect.top) / rect.height - 0.5;
      setOffset({ x: mx * 8, y: my * 6 });
    };
    const reset = () => setOffset({ x: 0, y: 0 });
    el.addEventListener("mousemove", handler);
    el.addEventListener("mouseleave", reset);
    return () => { el.removeEventListener("mousemove", handler); el.removeEventListener("mouseleave", reset); };
  }, [containerRef, noMotion]);

  return offset;
}

/* ─── component ─── */

export default function DistrictsOverviewGraph({ districts }: { districts: District[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [leafId, setLeafId] = useState<string | null>(null);
  const [view, setView] = useState<"graph" | "list">("graph");
  const [regionFilter, setRegionFilter] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [w, setW] = useState(1000);
  const noMotion = useReducedMotion();
  const [entered, setEntered] = useState(false);
  const initRef = useRef(false);

  const parallax = useMouseParallax(graphRef, noMotion);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const m = () => {
      const newW = el.getBoundingClientRect().width;
      setW(newW);
      if (!initRef.current) {
        initRef.current = true;
        if (newW < 640) setView("list");
      }
    };
    m();
    const ro = new ResizeObserver(m);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const mob = w < 640;

  const h = Math.max(mob ? 420 : 540, Math.min(w * 0.65, 640));
  const cx = w / 2;
  const cy = h / 2;

  // node sizing by content
  const counts = useMemo(() => districts.map(contentCount), [districts]);
  const maxCount = Math.max(...counts, 1);

  const distR = mob ? 140 : Math.min(w * 0.3, 240);
  const dNodes = useMemo(() => districts.map((d, i) => {
    const a = (i / districts.length) * Math.PI * 2 - Math.PI / 2;
    const cc = contentCount(d);
    const sizeScale = 0.7 + 0.6 * (cc / maxCount);
    return { ...d, x: cx + Math.cos(a) * distR, y: cy + Math.sin(a) * distR, a, cc, sizeScale };
  }), [districts, cx, cy, distR, maxCount]);

  // inter-district edges (deduplicated)
  const interEdges = useMemo(() => {
    const edges: { from: typeof dNodes[0]; to: typeof dNodes[0]; key: string }[] = [];
    const seen = new Set<string>();
    for (const n of dNodes) {
      const neighbors = ADJACENCY[n.id] ?? [];
      for (const nid of neighbors) {
        const key = [n.id, nid].sort().join("-");
        if (seen.has(key)) continue;
        seen.add(key);
        const target = dNodes.find((d) => d.id === nid);
        if (target) edges.push({ from: n, to: target, key });
      }
    }
    return edges;
  }, [dNodes]);

  const openD = openId ? dNodes.find((d) => d.id === openId) : null;
  const kids = useMemo(() => (openD ? getChildren(openD) : []), [openD]);
  const childR = mob ? 110 : 165;
  const kidNodes = useMemo(() => {
    if (!openD) return [];
    return kids.map((k, i) => {
      const a = (i / kids.length) * Math.PI * 2 - Math.PI / 2;
      return { ...k, x: cx + Math.cos(a) * childR, y: cy + Math.sin(a) * childR, a };
    });
  }, [openD, kids, cx, cy, childR]);

  useParticleCanvas(canvasRef, w, h, dNodes, cx, cy, noMotion, entered, !!openId);

  const clickDist = useCallback((id: string) => { setLeafId(null); setOpenId((p) => (p === id ? null : id)); }, []);
  const clickLeaf = useCallback((id: string, e: React.MouseEvent | React.KeyboardEvent) => { e.stopPropagation(); setLeafId((p) => (p === id ? null : id)); }, []);
  const close = useCallback(() => { setLeafId(null); setOpenId(null); }, []);
  const onKey = useCallback((fn: () => void) => (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); } }, []);

  const centerSize = mob ? 80 : 116;
  const baseDistSize = mob ? 52 : 68;
  const kidSize = mob ? 46 : 60;
  const an = (v: string) => noMotion ? "none" : v;

  // hover magnetism: compute offset for each node based on hovered node
  const getMagnetOffset = useCallback((nodeId: string, nodeX: number, nodeY: number) => {
    if (!hoveredId || hoveredId === nodeId || noMotion) return { mx: 0, my: 0 };
    const hovered = dNodes.find((d) => d.id === hoveredId);
    if (!hovered) return { mx: 0, my: 0 };
    const dx = nodeX - hovered.x;
    const dy = nodeY - hovered.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 200 || dist < 1) return { mx: 0, my: 0 };
    const force = Math.max(0, (200 - dist) / 200) * 6;
    return { mx: (dx / dist) * force, my: (dy / dist) * force };
  }, [hoveredId, dNodes, noMotion]);

  const filteredDistricts = regionFilter ? districts.filter(d => d.region === regionFilter) : districts;

  return (
    <div className="space-y-6" ref={ref}>
      {/* Region pills + view toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(["south", "central", "north"] as const).map((r) => (
            <button key={r} onClick={() => setRegionFilter(regionFilter === r ? null : r)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-kerala-gold ${regionFilter === r ? "scale-105" : ""}`} style={{ background: regionFilter === r ? R[r].bg.replace("0.06", "0.15") : R[r].bg, border: `1px solid ${R[r].b}`, color: R[r].hue }} aria-pressed={regionFilter === r} aria-label={`Filter by ${r} Kerala`}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: R[r].hue }} />
              {r === "south" ? "South" : r === "central" ? "Central" : "North"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ background: "rgba(30,58,95,0.3)" }}>
          <button onClick={() => setView("graph")} className={`px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wide transition-all duration-300 ${view === "graph" ? "bg-kerala-surface text-kerala-white" : "text-kerala-muted hover:text-kerala-white"}`} aria-label="Graph view" aria-pressed={view === "graph"}>Graph</button>
          <button onClick={() => setView("list")} className={`px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wide transition-all duration-300 ${view === "list" ? "bg-kerala-surface text-kerala-white" : "text-kerala-muted hover:text-kerala-white"}`} aria-label="List view" aria-pressed={view === "list"}>Cards</button>
        </div>
      </div>

      {view === "graph" ? (
        /* ── Graph view ── */
        <div ref={graphRef} className="relative overflow-hidden rounded-3xl" style={{ height: h }} role="img" aria-label={`Interactive graph of all 14 Kerala districts grouped by region`}>
          {/* Background layers */}
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(27,107,58,0.06) 0%, rgba(10,22,40,0.98) 65%)" }} />
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(circle at 30% 25%, rgba(232,160,32,0.03) 0%, transparent 50%), radial-gradient(circle at 70% 75%, rgba(27,107,58,0.03) 0%, transparent 50%)",
            animation: an("ovAmbient 20s ease-in-out infinite alternate"),
            transform: `translate(${parallax.x * 0.5}px, ${parallax.y * 0.5}px)`,
          }} />

          {/* Dot grid with parallax */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.025, transform: `translate(${parallax.x * 0.3}px, ${parallax.y * 0.3}px)` }}>
            <defs><pattern id="og" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.6" fill="#F9F5EE" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#og)" />
          </svg>

          {/* Particle canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: entered ? 1 : 0, transition: "opacity 1s ease" }} />

          {/* SVG connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: `translate(${parallax.x * 0.15}px, ${parallax.y * 0.15}px)` }}>
            <defs>
              {/* animated dash for inter-district lines */}
              <linearGradient id="lineGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F9F5EE" stopOpacity="0.06" />
                <stop offset="50%" stopColor="#E8A020" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#F9F5EE" stopOpacity="0.06" />
              </linearGradient>
              <filter id="edgeGlow">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
              </filter>
            </defs>

            {/* Orbit ring */}
            {!openId && <circle cx={cx} cy={cy} r={distR} fill="none" stroke="#F9F5EE" strokeWidth="0.4" strokeDasharray="3 12" style={{ opacity: entered || noMotion ? 0.06 : 0, transition: "opacity 0.8s ease 0.3s" }} />}
            {openD && <circle cx={cx} cy={cy} r={childR} fill="none" stroke={R[openD.region].hue} strokeWidth="0.5" strokeDasharray="3 10" opacity="0.15" style={{ animation: an("ovRingIn 0.6s ease") }} />}

            {/* Inter-district connections (the graph web) */}
            {!openId && interEdges.map(({ from, to, key }) => {
              const isHovered = hoveredId === from.id || hoveredId === to.id;
              const bothFiltered = !regionFilter || (from.region === regionFilter && to.region === regionFilter);
              const oneFiltered = regionFilter && (from.region !== regionFilter || to.region !== regionFilter);
              return (
                <g key={`ie-${key}`}>
                  {/* glow layer */}
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke={isHovered ? "#E8A020" : "#F9F5EE"}
                    strokeWidth={isHovered ? 3 : 1.5}
                    filter="url(#edgeGlow)"
                    style={{
                      opacity: (entered || noMotion ? (isHovered ? 0.15 : oneFiltered ? 0.01 : 0.03) : 0),
                      transition: "all 0.5s ease",
                    }}
                  />
                  {/* crisp line */}
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                    stroke={isHovered ? "#E8A020" : "#F9F5EE"}
                    strokeWidth={isHovered ? 0.8 : 0.3}
                    strokeDasharray={isHovered ? "none" : "2 8"}
                    style={{
                      opacity: (entered || noMotion ? (isHovered ? 0.4 : oneFiltered ? 0.03 : 0.06) : 0),
                      transition: "all 0.5s ease",
                    }}
                  />
                </g>
              );
            })}

            {/* Hub-spoke lines */}
            {!openId && dNodes.map((d) => {
              const isHovered = hoveredId === d.id;
              return (
                <line key={`l-${d.id}`} x1={cx} y1={cy} x2={d.x} y2={d.y}
                  stroke={R[d.region].hue}
                  strokeWidth={isHovered ? 1 : 0.4}
                  style={{
                    opacity: entered || noMotion ? (isHovered ? 0.35 : 0.08) : 0,
                    transition: "all 0.5s ease",
                  }}
                />
              );
            })}

            {/* Child node lines */}
            {openD && kidNodes.map((k) => {
              const sel = leafId === k.id;
              return <line key={`lk-${k.id}`} x1={cx} y1={cy} x2={k.x} y2={k.y} stroke={C[k.type].hue} strokeWidth={sel ? 1.2 : 0.5} style={{ opacity: sel ? 0.5 : 0.15, transition: "all 0.5s" }} />;
            })}
          </svg>

          {/* Center node */}
          <div className="absolute z-30" style={{ left: cx + parallax.x * 0.1, top: cy + parallax.y * 0.1, transform: "translate(-50%,-50%)", transition: noMotion ? "none" : "left 0.15s ease-out, top 0.15s ease-out" }}>
            <div
              onClick={openId ? close : undefined}
              onKeyDown={openId ? onKey(close) : undefined}
              tabIndex={openId ? 0 : -1}
              role={openId ? "button" : undefined}
              aria-label={openId && openD ? `Close ${openD.name}, return to all districts` : "Kerala"}
              className="rounded-full flex items-center justify-center cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-kerala-gold"
              style={{
                width: openId ? (mob ? 84 : 114) : centerSize,
                height: openId ? (mob ? 84 : 114) : centerSize,
                padding: 3,
                background: "linear-gradient(135deg, rgba(232,160,32,0.12), rgba(27,107,58,0.12))",
                border: "1px solid rgba(232,160,32,0.18)",
                transition: "all 0.6s cubic-bezier(0.32,0.72,0,1)",
              }}
            >
              <div className="rounded-full w-full h-full flex flex-col items-center justify-center text-center relative" style={{
                background: "radial-gradient(circle at 35% 30%, #162035, #0A1628)",
                boxShadow: "inset 0 1px 1px rgba(255,255,255,0.05), 0 0 60px rgba(232,160,32,0.1), 0 0 120px rgba(27,107,58,0.06)",
              }}>
                {openId && openD ? (
                  <>
                    <span className="font-newsreader font-bold text-kerala-white leading-tight" style={{ fontSize: mob ? 12 : 16 }}>{openD.name}</span>
                    <span className="font-malayalam text-kerala-gold/70 mt-0.5" style={{ fontSize: mob ? 9 : 11 }}>{openD.malayalamName}</span>
                  </>
                ) : (
                  <>
                    <span className="font-newsreader font-bold text-kerala-white" style={{ fontSize: mob ? 16 : 22 }}>Kerala</span>
                    <span className="font-malayalam text-kerala-gold/70" style={{ fontSize: mob ? 10 : 12 }}>{"കേരളം"}</span>
                  </>
                )}
                <div className="absolute inset-0 rounded-full" style={{ border: "1px solid rgba(232,160,32,0.1)", animation: an("ovPulse 4s ease-out infinite") }} />
                <div className="absolute inset-0 rounded-full" style={{ border: "1px solid rgba(232,160,32,0.06)", animation: an("ovPulse 4s ease-out infinite 1.5s") }} />
              </div>
            </div>
          </div>

          {/* District nodes */}
          {!openId && dNodes.map((d, i) => {
            const m = R[d.region];
            const nodeSize = Math.round(baseDistSize * d.sizeScale);
            const mag = getMagnetOffset(d.id, d.x, d.y);
            const isHov = hoveredId === d.id;
            const isNeighbor = hoveredId ? (ADJACENCY[hoveredId]?.includes(d.id) ?? false) : false;

            if (regionFilter && d.region !== regionFilter) return (
              <div key={d.id} className="absolute z-10" style={{ left: d.x, top: d.y, transform: "translate(-50%,-50%)", opacity: 0.15, transition: "opacity 0.4s" }}>
                <div className="rounded-full" style={{ width: baseDistSize * 0.5, height: baseDistSize * 0.5, background: m.bg, border: `1px solid ${m.b}` }} />
              </div>
            );
            return (
              <div key={d.id} className="absolute z-10" style={{
                left: d.x + mag.mx + parallax.x * (0.2 + i * 0.02),
                top: d.y + mag.my + parallax.y * (0.2 + i * 0.02),
                transform: "translate(-50%,-50%)",
                opacity: entered || noMotion ? 1 : 0,
                animation: entered && !noMotion
                  ? `ovEntrance 0.6s cubic-bezier(0.32,0.72,0,1) ${0.1 + i * 0.06}s both, ovFloat ${7 + (i % 3) * 1.5}s ease-in-out infinite ${1 + (i * 0.8) % 10}s`
                  : "none",
                transition: noMotion ? "none" : "left 0.3s ease-out, top 0.3s ease-out",
              }}>
                <button
                  onClick={() => clickDist(d.id)}
                  onKeyDown={onKey(() => clickDist(d.id))}
                  onMouseEnter={() => setHoveredId(d.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  aria-label={`${d.name} district (${d.region} Kerala). ${d.tagline}. ${d.cc} places.`}
                  className="relative rounded-full flex items-center justify-center group outline-none focus-visible:ring-2 focus-visible:ring-kerala-gold"
                  style={{
                    width: nodeSize, height: nodeSize, padding: 2,
                    border: `1px solid ${isHov || isNeighbor ? m.hue : m.b}`,
                    boxShadow: isHov ? m.g : isNeighbor ? `0 0 15px ${m.hue}20` : "none",
                    transition: "all 0.4s cubic-bezier(0.32,0.72,0,1)",
                    transform: isHov ? "scale(1.12)" : "scale(1)",
                  }}
                >
                  <div className="rounded-full w-full h-full flex flex-col items-center justify-center text-center" style={{ background: `radial-gradient(circle at 40% 35%, ${m.bg}, rgba(10,22,40,0.9))` }}>
                    <span className="font-newsreader font-semibold text-kerala-white/90 leading-tight" style={{ fontSize: mob ? 9 : Math.max(10, Math.round(12 * d.sizeScale * 0.85)) }}>{d.name}</span>
                    <span className="font-malayalam text-kerala-muted/50 mt-0.5" style={{ fontSize: mob ? 7 : 8 }}>{d.malayalamName}</span>
                  </div>
                  {/* Outer glow ring */}
                  <div className="absolute rounded-full pointer-events-none" style={{
                    inset: -6,
                    border: `1px solid ${m.hue}`,
                    boxShadow: m.g,
                    opacity: isHov ? 1 : 0,
                    transition: "opacity 0.4s cubic-bezier(0.32,0.72,0,1)",
                  }} />
                  {/* Discovery pulse */}
                  <div className="absolute inset-[-6px] rounded-full pointer-events-none" style={{ border: `1px solid ${m.hue}`, animation: an(`ovDiscoverPulse 3s ease-out infinite ${(i * 0.5) % 4}s`), opacity: 0 }} />
                  {/* Content count badge */}
                  <div className="absolute -bottom-1 -right-1 rounded-full flex items-center justify-center text-[7px] font-bold pointer-events-none" style={{
                    width: 18, height: 18,
                    background: "rgba(10,22,40,0.95)",
                    border: `1px solid ${m.b}`,
                    color: m.hue,
                    opacity: 0.7,
                  }}>
                    {d.cc}
                  </div>
                </button>

                {/* Hover tooltip */}
                <div className="absolute pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-40" style={{
                  left: "50%", bottom: nodeSize / 2 + 16, transform: "translateX(-50%)", whiteSpace: "nowrap",
                }}>
                  <div className="rounded-xl px-3.5 py-2 text-center" style={{ background: "rgba(10,22,40,0.96)", backdropFilter: "blur(16px)", border: `1px solid ${m.b}`, boxShadow: m.g }}>
                    <div className="text-[11px] font-semibold text-kerala-white mb-1">{d.tagline}</div>
                    <div className="flex gap-1 justify-center">
                      {d.famousFor.slice(0, 2).map((f) => (
                        <span key={f} className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: m.bg, color: m.hue, border: `1px solid ${m.b}` }}>{f}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Child nodes */}
          {openD && kidNodes.map((k, ki) => {
            const cm = C[k.type];
            const sel = leafId === k.id;
            return (
              <div key={k.id} className="absolute" style={{
                left: k.x, top: k.y, transform: "translate(-50%,-50%)",
                zIndex: sel ? 35 : 15,
                animation: an(`ovSpawn 0.5s cubic-bezier(0.32,0.72,0,1) ${ki * 0.05}s both`),
              }}>
                <button
                  onClick={(e) => clickLeaf(k.id, e)}
                  onKeyDown={onKey(() => setLeafId((p) => (p === k.id ? null : k.id)))}
                  aria-label={`${k.label}${k.desc ? `: ${k.desc.slice(0, 60)}` : ""}`}
                  aria-pressed={sel}
                  className="relative rounded-full flex items-center justify-center group outline-none focus-visible:ring-2 focus-visible:ring-kerala-gold"
                  style={{
                    width: kidSize, height: kidSize, padding: 2,
                    border: `1px solid ${sel ? cm.hue : cm.b}`,
                    backdropFilter: "blur(8px)",
                    boxShadow: sel ? cm.g : "none",
                    transition: "all 0.4s cubic-bezier(0.32,0.72,0,1)",
                    transform: sel ? "scale(1.15)" : "scale(1)",
                  }}
                >
                  <div className="rounded-full w-full h-full flex items-center justify-center" style={{ background: `radial-gradient(circle at 40% 35%, ${cm.bg}, rgba(10,22,40,0.9))` }}>
                    <span className="text-center leading-tight px-1" style={{ fontSize: mob ? 8 : 10 }}>
                      {(() => { const I = CATEGORY_ICONS[k.type]; return I ? <I className="w-4 h-4 mb-0.5 mx-auto" aria-hidden /> : null; })()}
                      <span className="text-kerala-white/85 font-medium line-clamp-2">
                        {k.label.length > (mob ? 12 : 16) ? k.label.slice(0, mob ? 10 : 14) + "…" : k.label}
                      </span>
                    </span>
                  </div>
                  <div className="absolute inset-[-3px] rounded-full opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 pointer-events-none" style={{ border: `1px solid ${cm.hue}`, boxShadow: cm.g, transition: "opacity 0.3s" }} />
                </button>

                {sel && (
                  <div className="absolute z-50" style={{
                    width: mob ? 260 : 320,
                    left: k.x > cx ? -(mob ? 270 : 332) : kidSize / 2 + 14,
                    top: "50%", transform: "translateY(-50%)",
                    animation: an("ovCardIn 0.35s cubic-bezier(0.32,0.72,0,1)"),
                  }}>
                    <div className="rounded-2xl p-[2px]" style={{ background: `linear-gradient(135deg, ${cm.b}, transparent 60%)` }}>
                      <div className="rounded-[calc(1rem-2px)] p-4" role="dialog" aria-label={`Details for ${k.label}`} style={{ background: "rgba(8,18,35,0.97)", backdropFilter: "blur(24px)", boxShadow: `${cm.g}, inset 0 1px 1px rgba(255,255,255,0.04), 0 8px 40px rgba(0,0,0,0.4)` }}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-[0.18em] font-bold" style={{ background: cm.bg, color: cm.hue, border: `1px solid ${cm.b}` }}>
                              {(() => { const I = CATEGORY_ICONS[k.type]; return I ? <I className="w-3 h-3 inline" aria-hidden /> : null; })()} {cm.label}
                            </span>
                            <h4 className="font-newsreader text-lg font-bold text-kerala-white mt-2 leading-tight">{k.label}</h4>
                            {k.sub && <span className="text-[10px] font-malayalam text-kerala-muted/70">{k.sub}</span>}
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); setLeafId(null); }} aria-label="Close details" className="text-kerala-muted hover:text-kerala-white text-sm shrink-0 rounded-full w-6 h-6 flex items-center justify-center hover:bg-white/5 transition-colors mt-1 outline-none focus-visible:ring-2 focus-visible:ring-kerala-gold"><X className="w-3.5 h-3.5" /></button>
                        </div>
                        {k.desc && <p className="text-[11px] text-kerala-muted/80 leading-relaxed">{k.desc}</p>}
                        {k.hl && k.hl.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {k.hl.map((h) => (
                              <span key={h} className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(255,255,255,0.03)", color: "#94A3B8", border: "1px solid rgba(255,255,255,0.06)" }}>{h}</span>
                            ))}
                          </div>
                        )}
                        {k.issues != null && (
                          <div className="mt-3 pt-2.5" style={{ borderTop: "1px solid rgba(30,58,95,0.25)" }}>
                            <span className="text-[10px] font-semibold text-rose-400/70">{"⚠️"} {k.issues} active issues</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {openD && (
            <div className="absolute z-30" style={{ left: cx, top: cy + (mob ? 60 : 85), transform: "translateX(-50%)", animation: an("ovFadeIn 0.4s ease 0.2s both") }}>
              <Link href={`/district/${openD.slug}`} className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-300 hover:scale-105 outline-none focus-visible:ring-2 focus-visible:ring-kerala-gold" style={{
                background: R[openD.region].bg, border: `1px solid ${R[openD.region].b}`, color: R[openD.region].hue, boxShadow: R[openD.region].g,
              }}>
                Open {openD.name} Page {"→"}
              </Link>
            </div>
          )}

          {openId && <div className="absolute inset-0 z-[4]" onClick={close} aria-hidden="true" />}

          {!openId && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center gap-1" style={{ animation: an("ovFadeIn 1s ease 2s both") }}>
              <span className="inline-block" style={{ animation: an("ovBounce 2s ease-in-out infinite") }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v8M5 7l3 3 3-3" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/></svg>
              </span>
              <span className="text-[11px] text-kerala-muted/40 tracking-[0.2em] uppercase font-medium">Click a district to explore</span>
            </div>
          )}
          {openId && !leafId && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 pointer-events-none" style={{ animation: an("ovFadeIn 0.5s ease 0.5s both") }}>
              <span className="text-[11px] text-kerala-muted/40 tracking-[0.2em] uppercase font-medium">Click a node for details</span>
            </div>
          )}
        </div>
      ) : (
        /* ── List / Card view ── */
        <div className="space-y-4">
          {(["south", "central", "north"] as const).map((region) => {
            const rDistricts = filteredDistricts.filter(d => d.region === region);
            if (!rDistricts.length) return null;
            const m = R[region];
            return (
              <div key={region} className="space-y-3" role="region" aria-label={`${region} Kerala districts`}>
                <h3 className="flex items-center gap-2 text-sm font-semibold" style={{ color: m.hue }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: m.hue }} />
                  {region === "south" ? "South" : region === "central" ? "Central" : "North"} Kerala
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {rDistricts.map((d) => (
                    <Link key={d.id} href={`/district/${d.slug}`} className="rounded-xl p-4 space-y-2 transition-all duration-300 hover:scale-[1.02] block" style={{ background: m.bg, border: `1px solid ${m.b}` }}>
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="font-newsreader font-bold text-kerala-white">{d.name}</h4>
                        <span className="font-malayalam text-kerala-muted/50 text-xs">{d.malayalamName}</span>
                      </div>
                      <p className="text-xs text-kerala-muted/80 leading-relaxed line-clamp-2">{d.tagline}</p>
                      <div className="flex flex-wrap gap-1">
                        {d.famousFor.slice(0, 3).map((f) => (
                          <span key={f} className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(255,255,255,0.03)", color: "#94A3B8", border: "1px solid rgba(255,255,255,0.06)" }}>{f}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-kerala-muted/50 pt-1">
                        <span>{"\u{1F3DB}️"} {d.capital}</span>
                        <span>{"\u{1F4CD}"} {d.subLocations.length} hubs</span>
                        <span>{"\u{1F3D6}️"} {d.touristSpots.length} spots</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        @keyframes ovPulse { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(2.5); opacity: 0; } }
        @keyframes ovFloat {
          0%, 100% { transform: translate(-50%,-50%) translateY(0); }
          33% { transform: translate(-50%,-50%) translateY(-7px) translateX(4px); }
          66% { transform: translate(-50%,-50%) translateY(5px) translateX(-3px); }
        }
        @keyframes ovSpawn {
          0% { opacity: 0; transform: translate(-50%,-50%) scale(0); }
          60% { transform: translate(-50%,-50%) scale(1.08); }
          100% { opacity: 1; transform: translate(-50%,-50%) scale(1); }
        }
        @keyframes ovCardIn {
          0% { opacity: 0; transform: translateY(-50%) scale(0.9) translateX(8px); }
          100% { opacity: 1; transform: translateY(-50%) scale(1) translateX(0); }
        }
        @keyframes ovFadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes ovRingIn { 0% { opacity: 0; r: 0; } 100% { opacity: 0.15; } }
        @keyframes ovAmbient { 0% { opacity: 0.6; } 100% { opacity: 1; } }
        @keyframes ovEntrance {
          0% { opacity: 0; transform: translate(-50%,-50%) scale(0.3); }
          60% { transform: translate(-50%,-50%) scale(1.06); }
          100% { opacity: 1; transform: translate(-50%,-50%) scale(1); }
        }
        @keyframes ovDiscoverPulse {
          0% { transform: scale(1); opacity: 0.25; }
          50% { transform: scale(1.35); opacity: 0; }
          100% { transform: scale(1.35); opacity: 0; }
        }
        @keyframes ovBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }
      `}</style>
    </div>
  );
}
