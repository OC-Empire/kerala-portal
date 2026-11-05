"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import type { District } from "@/lib/districts";

/* ─── types ─── */

export interface GraphPlace {
  name: string;
  category: string;
  description: string | null;
  address: string | null;
  imageUrl: string | null;
  website: string | null;
  phone: string | null;
  hours: string | null;
  fee: string | null;
}

/* ─── palette ─── */

const M: Record<string, { hue: string; g: string; bg: string; b: string; icon: string; label: string }> = {
  sub_location: { hue: "#38BDF8", icon: "\u{1F4CD}", label: "Hubs",    g: "0 0 28px rgba(56,189,248,0.4), 0 0 60px rgba(56,189,248,0.12)", bg: "rgba(56,189,248,0.07)", b: "rgba(56,189,248,0.3)" },
  tourist:      { hue: "#FBBF24", icon: "\u{1F3D6}️", label: "Spots",   g: "0 0 28px rgba(251,191,36,0.4), 0 0 60px rgba(251,191,36,0.12)", bg: "rgba(251,191,36,0.07)", b: "rgba(251,191,36,0.3)" },
  food:         { hue: "#FB7185", icon: "\u{1F35B}", label: "Food",    g: "0 0 28px rgba(251,113,133,0.4), 0 0 60px rgba(251,113,133,0.12)", bg: "rgba(251,113,133,0.07)", b: "rgba(251,113,133,0.3)" },
  culture:      { hue: "#C084FC", icon: "\u{1F3AD}", label: "Culture", g: "0 0 28px rgba(192,132,252,0.4), 0 0 60px rgba(192,132,252,0.12)", bg: "rgba(192,132,252,0.07)", b: "rgba(192,132,252,0.3)" },
};

/* ─── data helpers ─── */

interface Leaf { id: string; label: string; sub?: string; emoji?: string; desc?: string; hl?: string[]; issues?: number; href?: string; type: string; place?: GraphPlace }
interface Cat { type: string; items: Leaf[] }
interface CatLink { a: string; b: string; count: number }

function buildCats(d: District, places: GraphPlace[]): Cat[] {
  const pMap = new Map<string, GraphPlace>();
  for (const p of places) pMap.set(p.name.toLowerCase(), p);
  const match = (name: string, cat?: string): GraphPlace | undefined => {
    const key = name.toLowerCase();
    const exact = pMap.get(key);
    if (exact && (!cat || exact.category === cat)) return exact;
    for (const [k, v] of pMap) {
      if (cat && v.category !== cat) continue;
      if (k.includes(key) || key.includes(k)) return v;
    }
    return undefined;
  };

  const out: Cat[] = [];
  const subs = d.subLocations.map((s) => ({ id: `s-${s.id}`, label: s.name, sub: s.malayalamName, type: "sub_location", desc: s.tagline, hl: s.highlights, issues: s.activeIssuesCount, href: `/civic?district=${d.slug}`, place: match(s.name) }));
  if (subs.length) out.push({ type: "sub_location", items: subs });
  const spots = d.touristSpots.map((t) => ({ id: `t-${t.name}`, label: t.name, type: "tourist", emoji: t.emoji, desc: match(t.name)?.description || t.description, place: match(t.name) }));
  if (spots.length) out.push({ type: "tourist", items: spots });
  const food = d.signatureFood.map((f) => ({ id: `f-${f}`, label: f, type: "food", emoji: "\u{1F35B}", desc: match(f, "food")?.description ?? undefined, place: match(f, "food") }));
  if (food.length) out.push({ type: "food", items: food });
  const cult = d.culturalIcons.map((c) => ({ id: `c-${c}`, label: c, type: "culture", emoji: "\u{1F3AD}", desc: match(c, "culture")?.description ?? undefined, place: match(c, "culture") }));
  if (cult.length) out.push({ type: "culture", items: cult });
  return out;
}

function buildCatLinks(cats: Cat[]): CatLink[] {
  const links: CatLink[] = [];
  for (let i = 0; i < cats.length; i++) {
    for (let j = i + 1; j < cats.length; j++) {
      let count = 0;
      for (const a of cats[i].items) {
        const aText = [a.desc, ...(a.hl || [])].filter(Boolean).join(" ").toLowerCase();
        for (const b of cats[j].items) {
          const bWords = b.label.toLowerCase().split(/\s+/).filter(w => w.length > 3);
          if (bWords.some(w => aText.includes(w))) { count++; continue; }
          const bText = [b.desc, ...(b.hl || [])].filter(Boolean).join(" ").toLowerCase();
          const aWords = a.label.toLowerCase().split(/\s+/).filter(w => w.length > 3);
          if (aWords.some(w => bText.includes(w))) count++;
        }
      }
      if (count > 0) links.push({ a: cats[i].type, b: cats[j].type, count });
    }
  }
  return links;
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

/* ─── layout types ─── */

type PlacedCat = Cat & { x: number; y: number; a: number };
type PlacedLeaf = Leaf & { x: number; y: number; a: number };

/* ─── component ─── */

export default function DistrictGraph({ district, places = [], initialCat }: { district: District; places?: GraphPlace[]; initialCat?: string }) {
  const cats = useMemo(() => buildCats(district, places), [district, places]);
  const catLinks = useMemo(() => buildCatLinks(cats), [cats]);
  const [openCat, setOpenCat] = useState<string | null>(() => {
    if (initialCat && ["sub_location", "tourist", "food", "culture"].includes(initialCat)) return initialCat;
    return null;
  });
  const [leafId, setLeafId] = useState<string | null>(null);
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const [view, setView] = useState<"graph" | "list">("graph");
  const [entered, setEntered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(800);
  const noMotion = useReducedMotion();
  const initRef = useRef(false);

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

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(t);
  }, []);

  /* FIX #3: tighter canvas — 420-500px instead of 580-680px */
  const h = Math.max(mob ? 340 : 420, Math.min(w * 0.5, 500));
  const cx = w / 2;
  const cy = h / 2;
  const catR = mob ? 100 : Math.min(w * 0.22, 170);
  const catNodes: PlacedCat[] = useMemo(() => cats.map((c, i) => {
    const a = (i / cats.length) * Math.PI * 2 - Math.PI / 2;
    return { ...c, x: cx + Math.cos(a) * catR, y: cy + Math.sin(a) * catR, a };
  }), [cats, cx, cy, catR]);

  const openC = openCat ? catNodes.find((c) => c.type === openCat) : null;
  const leafR = mob ? 100 : 155;
  const leafNodes: PlacedLeaf[] = useMemo(() => {
    if (!openC) return [];
    return openC.items.map((item, i) => {
      const a = (i / openC.items.length) * Math.PI * 2 - Math.PI / 2;
      return { ...item, x: cx + Math.cos(a) * leafR, y: cy + Math.sin(a) * leafR, a };
    });
  }, [openC, cx, cy, leafR]);

  const selectedLeaf = leafId ? leafNodes.find((l) => l.id === leafId) : null;

  const clickCat = useCallback((t: string) => { setLeafId(null); setOpenCat((p) => (p === t ? null : t)); }, []);
  const clickLeaf = useCallback((id: string, e: React.MouseEvent | React.KeyboardEvent) => { e.stopPropagation(); setLeafId((p) => (p === id ? null : id)); }, []);
  const close = useCallback(() => { setLeafId(null); setOpenCat(null); }, []);
  const onKey = useCallback((fn: () => void) => (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); } }, []);

  const centerSize = mob ? 72 : 100;
  const catSize = mob ? 54 : 70;
  const leafSize = mob ? 46 : 58;
  const an = (v: string) => noMotion ? "none" : v;

  /* FIX #1 + #4: bolder cross-connections, highlighted on hover */
  const crossPaths = useMemo(() => {
    if (openCat) return [];
    return catLinks.map(link => {
      const nA = catNodes.find(c => c.type === link.a);
      const nB = catNodes.find(c => c.type === link.b);
      if (!nA || !nB) return null;
      const midX = (nA.x + nB.x) / 2;
      const midY = (nA.y + nB.y) / 2;
      const dx = midX - cx;
      const dy = midY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const bow = 20 + link.count * 5;
      const cpX = midX + (dx / dist) * bow;
      const cpY = midY + (dy / dist) * bow;
      return { ...link, path: `M${nA.x},${nA.y} Q${cpX},${cpY} ${nB.x},${nB.y}`, nA, nB };
    }).filter(Boolean) as { a: string; b: string; count: number; path: string; nA: PlacedCat; nB: PlacedCat }[];
  }, [catLinks, catNodes, openCat, cx, cy]);

  return (
    <div className="space-y-0" ref={ref}>
      <div className="rounded-3xl overflow-hidden" style={{ border: "1px solid rgba(30,58,95,0.3)" }}>

        {/* ── View toggle bar ── */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1" style={{ background: "rgba(10,22,40,0.6)" }}>
          <span className="text-[10px] uppercase tracking-[0.18em] text-kerala-muted/40 font-semibold">Explore {district.name}</span>
          <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ background: "rgba(30,58,95,0.3)" }}>
            <button onClick={() => setView("graph")} className={`px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wide transition-all duration-300 ${view === "graph" ? "bg-kerala-surface text-kerala-white" : "text-kerala-muted hover:text-kerala-white"}`} aria-label="Graph view" aria-pressed={view === "graph"}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="inline mr-1 -mt-px"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="3" cy="4" r="1.2" fill="currentColor" opacity="0.5"/><circle cx="13" cy="4" r="1.2" fill="currentColor" opacity="0.5"/><circle cx="13" cy="12" r="1.2" fill="currentColor" opacity="0.5"/><circle cx="3" cy="12" r="1.2" fill="currentColor" opacity="0.5"/></svg>
              Graph
            </button>
            <button onClick={() => setView("list")} className={`px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-wide transition-all duration-300 ${view === "list" ? "bg-kerala-surface text-kerala-white" : "text-kerala-muted hover:text-kerala-white"}`} aria-label="List view" aria-pressed={view === "list"}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="inline mr-1 -mt-px"><rect x="1" y="2" width="6" height="5" rx="1" stroke="currentColor" strokeWidth="1.1"/><rect x="9" y="2" width="6" height="5" rx="1" stroke="currentColor" strokeWidth="1.1"/><rect x="1" y="9" width="6" height="5" rx="1" stroke="currentColor" strokeWidth="1.1"/><rect x="9" y="9" width="6" height="5" rx="1" stroke="currentColor" strokeWidth="1.1"/></svg>
              Cards
            </button>
          </div>
        </div>

        {view === "graph" ? (
          <>
            {/* ── Graph canvas — tighter height ── */}
            <div className="relative overflow-hidden select-none" style={{ height: h }} role="img" aria-label={`Interactive graph exploring ${district.name} across ${cats.length} categories: ${cats.map(c => M[c.type].label).join(", ")}`}>
              <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(27,107,58,0.06) 0%, rgba(10,22,40,0.98) 65%)" }} />
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 25% 30%, rgba(232,160,32,0.025) 0%, transparent 50%), radial-gradient(circle at 75% 70%, rgba(27,107,58,0.025) 0%, transparent 50%)" }} />
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.02 }}>
                <defs><pattern id="dgp" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.6" fill="#F9F5EE" /></pattern></defs>
                <rect width="100%" height="100%" fill="url(#dgp)" />
              </svg>

              {/* SVG layer */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {!openCat && <circle cx={cx} cy={cy} r={catR} fill="none" stroke="#F9F5EE" strokeWidth="0.4" strokeDasharray="3 12" opacity="0.05" />}
                {openC && <circle cx={cx} cy={cy} r={leafR} fill="none" stroke={M[openC.type].hue} strokeWidth="0.5" strokeDasharray="3 10" opacity="0.15" style={{ animation: an("dgRing 0.6s ease") }} />}

                {!openCat && catNodes.map((c) => (
                  <line key={`lc-${c.type}`} x1={cx} y1={cy} x2={c.x} y2={c.y} stroke={M[c.type].hue} strokeWidth="0.4" opacity="0.08" />
                ))}

                {/* FIX #1: Bold cross-connections + FIX #4: hover highlight */}
                {crossPaths.map((cp) => {
                  const isHovered = hoveredCat === cp.a || hoveredCat === cp.b;
                  const baseOpacity = isHovered ? 0.6 : 0.25;
                  const baseWidth = isHovered ? 2.5 : Math.min(1.2 + cp.count * 0.4, 2.2);
                  return (
                    <g key={`xc-${cp.a}-${cp.b}`}>
                      {/* Glow layer */}
                      <path d={cp.path} fill="none" stroke={`url(#xg-${cp.a}-${cp.b})`} strokeWidth={baseWidth + 4} opacity={isHovered ? 0.12 : 0.04} style={{ filter: "blur(4px)", transition: "all 0.4s ease" }} />
                      {/* Main line */}
                      <path d={cp.path} fill="none" stroke={`url(#xg-${cp.a}-${cp.b})`} strokeWidth={baseWidth} opacity={baseOpacity} strokeLinecap="round" style={{ transition: "all 0.4s ease", animation: !isHovered ? an("dgCrossGlow 4s ease-in-out infinite") : "none" }}>
                        <title>{M[cp.a].label} {"↔"} {M[cp.b].label}: {cp.count} connection{cp.count > 1 ? "s" : ""}</title>
                      </path>
                      {/* Animated dot traveling along the path */}
                      {isHovered && (
                        <circle r="3" fill={M[cp.a].hue} opacity="0.7" style={{ filter: `drop-shadow(0 0 4px ${M[cp.a].hue})` }}>
                          <animateMotion dur="2s" repeatCount="indefinite" path={cp.path} />
                        </circle>
                      )}
                    </g>
                  );
                })}
                <defs>
                  {crossPaths.map((cp) => (
                    <linearGradient key={`xg-${cp.a}-${cp.b}`} id={`xg-${cp.a}-${cp.b}`} x1={cp.nA.x} y1={cp.nA.y} x2={cp.nB.x} y2={cp.nB.y} gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor={M[cp.a].hue} />
                      <stop offset="100%" stopColor={M[cp.b].hue} />
                    </linearGradient>
                  ))}
                </defs>

                {openC && leafNodes.map((l) => {
                  const sel = leafId === l.id;
                  return <line key={`ll-${l.id}`} x1={cx} y1={cy} x2={l.x} y2={l.y} stroke={M[openC.type].hue} strokeWidth={sel ? 1.2 : 0.5} style={{ opacity: sel ? 0.5 : 0.12, transition: "all 0.5s" }} />;
                })}
              </svg>

              {/* FIX #2: Center node with entrance animation */}
              <div className="absolute z-30" style={{
                left: cx, top: cy, transform: "translate(-50%,-50%)",
                opacity: entered || noMotion ? 1 : 0,
                transition: "opacity 0.6s ease, transform 0.6s cubic-bezier(0.32,0.72,0,1)",
              }}>
                <div
                  onClick={openCat ? close : undefined}
                  onKeyDown={openCat ? onKey(close) : undefined}
                  tabIndex={openCat ? 0 : -1}
                  role={openCat ? "button" : undefined}
                  aria-label={openCat && openC ? `Close ${M[openC.type].label}, return to overview` : `${district.name} — ${district.malayalamName}`}
                  className="rounded-full flex items-center justify-center cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-kerala-gold"
                  style={{
                    width: openCat ? (mob ? 64 : 88) : centerSize,
                    height: openCat ? (mob ? 64 : 88) : centerSize,
                    padding: 3,
                    background: openCat && openC ? `linear-gradient(135deg, ${M[openC.type].bg}, rgba(10,22,40,0.3))` : "linear-gradient(135deg, rgba(232,160,32,0.12), rgba(27,107,58,0.12))",
                    border: `1px solid ${openCat && openC ? M[openC.type].b : "rgba(232,160,32,0.18)"}`,
                    transition: "all 0.6s cubic-bezier(0.32,0.72,0,1)",
                  }}
                >
                  <div className="rounded-full w-full h-full flex flex-col items-center justify-center text-center relative" style={{
                    background: "radial-gradient(circle at 35% 30%, #162035, #0A1628)",
                    boxShadow: openCat && openC ? `inset 0 1px 1px rgba(255,255,255,0.05), ${M[openC.type].g}` : "inset 0 1px 1px rgba(255,255,255,0.05), 0 0 60px rgba(232,160,32,0.1)",
                  }}>
                    {openCat && openC ? (
                      <>
                        <span className="text-lg">{M[openC.type].icon}</span>
                        <span className="font-semibold text-kerala-white mt-0.5" style={{ fontSize: mob ? 8 : 11 }}>{M[openC.type].label}</span>
                      </>
                    ) : (
                      <>
                        <span className="font-newsreader font-bold text-kerala-white leading-tight" style={{ fontSize: mob ? 12 : 15 }}>{district.name}</span>
                        <span className="font-malayalam text-kerala-gold/70 mt-0.5" style={{ fontSize: mob ? 8 : 10 }}>{district.malayalamName}</span>
                      </>
                    )}
                    <div className="absolute inset-0 rounded-full" style={{ border: `1px solid ${openCat && openC ? M[openC.type].b : "rgba(232,160,32,0.1)"}`, animation: an("dgPulse 4s ease-out infinite") }} />
                  </div>
                </div>
              </div>

              {/* FIX #2: Category nodes with staggered entrance */}
              {!openCat && catNodes.map((cat, ci) => {
                const m = M[cat.type];
                return (
                  <div key={cat.type} className="absolute z-10" style={{
                    left: cat.x, top: cat.y,
                    transform: "translate(-50%,-50%)",
                    opacity: entered || noMotion ? 1 : 0,
                    animation: entered && !noMotion
                      ? `dgEntrance 0.6s cubic-bezier(0.32,0.72,0,1) ${0.15 + ci * 0.12}s both, dgFloat ${7 + ci * 1.5}s ease-in-out infinite ${1.2 + ci * 1.2}s`
                      : noMotion ? "none" : "none",
                  }}>
                    <button
                      onClick={() => clickCat(cat.type)}
                      onKeyDown={onKey(() => clickCat(cat.type))}
                      onMouseEnter={() => setHoveredCat(cat.type)}
                      onMouseLeave={() => setHoveredCat(null)}
                      onFocus={() => setHoveredCat(cat.type)}
                      onBlur={() => setHoveredCat(null)}
                      aria-label={`${m.label}: ${cat.items.length} items. Click to expand.`}
                      className="relative rounded-full flex items-center justify-center group outline-none focus-visible:ring-2 focus-visible:ring-kerala-gold"
                      style={{ width: catSize, height: catSize, padding: 2, border: `1px solid ${m.b}`, transition: "all 0.4s cubic-bezier(0.32,0.72,0,1)" }}
                    >
                      <div className="rounded-full w-full h-full flex flex-col items-center justify-center text-center" style={{ background: `radial-gradient(circle at 40% 35%, ${m.bg}, rgba(10,22,40,0.9))` }}>
                        <span className="text-xl mb-0.5">{m.icon}</span>
                        <span className="font-semibold text-kerala-white/90" style={{ fontSize: mob ? 8 : 10 }}>{m.label}</span>
                        <span className="text-[7px] text-kerala-muted/50">{cat.items.length}</span>
                      </div>
                      <div className="absolute inset-[-4px] rounded-full opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 pointer-events-none" style={{ border: `1px solid ${m.hue}`, boxShadow: m.g, transition: "opacity 0.4s" }} />
                      <div className="absolute inset-[-6px] rounded-full pointer-events-none" style={{ border: `1px solid ${m.hue}`, animation: an(`dgDiscoverPulse 3s ease-out infinite ${ci * 0.8}s`), opacity: 0 }} />
                    </button>
                  </div>
                );
              })}

              {/* Leaf nodes */}
              {openC && leafNodes.map((leaf, li) => {
                const cm = M[openC.type];
                const sel = leafId === leaf.id;
                return (
                  <div key={leaf.id} className="absolute" style={{
                    left: leaf.x, top: leaf.y, transform: "translate(-50%,-50%)",
                    zIndex: sel ? 35 : 15,
                    animation: an(`dgSpawn 0.5s cubic-bezier(0.32,0.72,0,1) ${li * 0.05}s both`),
                  }}>
                    <button
                      onClick={(e) => clickLeaf(leaf.id, e)}
                      onKeyDown={onKey(() => setLeafId((p) => (p === leaf.id ? null : leaf.id)))}
                      aria-label={`${leaf.label}${leaf.desc ? `: ${leaf.desc.slice(0, 60)}` : ""}. Click for details.`}
                      aria-pressed={sel}
                      className="relative rounded-full flex items-center justify-center group outline-none focus-visible:ring-2 focus-visible:ring-kerala-gold"
                      style={{
                        width: leafSize, height: leafSize, padding: 2,
                        border: `1px solid ${sel ? cm.hue : cm.b}`,
                        backdropFilter: "blur(8px)",
                        boxShadow: sel ? cm.g : "none",
                        transition: "all 0.4s cubic-bezier(0.32,0.72,0,1)",
                        transform: sel ? "scale(1.15)" : "scale(1)",
                      }}
                    >
                      <div className="rounded-full w-full h-full flex items-center justify-center" style={{ background: `radial-gradient(circle at 40% 35%, ${cm.bg}, rgba(10,22,40,0.9))` }}>
                        <span className="text-center leading-tight px-1" style={{ fontSize: mob ? 7 : 9 }}>
                          {leaf.emoji && <span className="block text-sm mb-0.5">{leaf.emoji}</span>}
                          <span className="text-kerala-white/85 font-medium line-clamp-2">
                            {leaf.label.length > (mob ? 10 : 14) ? leaf.label.slice(0, mob ? 8 : 12) + "…" : leaf.label}
                          </span>
                        </span>
                      </div>
                      <div className="absolute inset-[-3px] rounded-full opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 pointer-events-none" style={{ border: `1px solid ${cm.hue}`, boxShadow: cm.g, transition: "opacity 0.3s" }} />
                    </button>
                  </div>
                );
              })}

              {openCat && <div className="absolute inset-0 z-[4]" onClick={close} aria-hidden="true" />}

              {/* Discoverability hint */}
              {!openCat && !selectedLeaf && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center gap-0.5" style={{ animation: an("dgFade 1s ease 1.8s both") }}>
                  <span className="inline-block" style={{ animation: an("dgBounce 2s ease-in-out infinite") }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3v7M5.5 7.5l2.5 2.5 2.5-2.5" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/></svg>
                  </span>
                  <span className="text-[10px] text-kerala-muted/40 tracking-[0.18em] uppercase font-medium">Click any node to explore</span>
                </div>
              )}
            </div>

            {/* ── Explanation panel ── */}
            <div className="border-t" style={{ borderColor: "rgba(30,58,95,0.25)", background: "rgba(10,22,40,0.6)", backdropFilter: "blur(12px)" }}>
              {!openCat && !selectedLeaf && (
                <div className="p-5 md:p-7 space-y-4" style={{ animation: an("dgFade 0.4s ease") }}>
                  <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4">
                    <h2 className="font-newsreader text-2xl md:text-3xl font-bold text-kerala-white">{district.name}</h2>
                    <span className="font-malayalam text-lg text-kerala-gold/70">{district.malayalamName}</span>
                    <span className="text-[10px] uppercase tracking-[0.15em] px-2.5 py-0.5 rounded-full font-bold" style={{ background: "rgba(232,160,32,0.08)", color: "#E8A020", border: "1px solid rgba(232,160,32,0.2)" }}>
                      {district.region} Kerala
                    </span>
                  </div>
                  <p className="text-sm text-kerala-muted max-w-2xl">{district.tagline}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Capital", value: district.capital, icon: "\u{1F3DB}️" },
                      { label: "Population", value: district.population, icon: "\u{1F465}" },
                      { label: "Area", value: district.area, icon: "\u{1F5FA}️" },
                      { label: "Sub-Hubs", value: `${district.subLocations.length}`, icon: "\u{1F4CD}" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-xl p-3" style={{ background: "rgba(22,32,53,0.6)", border: "1px solid rgba(30,58,95,0.3)" }}>
                        <span className="text-base">{s.icon}</span>
                        <div className="text-[10px] text-kerala-muted mt-1">{s.label}</div>
                        <div className="text-sm font-semibold text-kerala-white">{s.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {district.famousFor.map((f) => (
                      <span key={f} className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: "rgba(27,107,58,0.1)", color: "#2E8B57", border: "1px solid rgba(27,107,58,0.25)" }}>{"★"} {f}</span>
                    ))}
                  </div>
                  {catLinks.length > 0 && (
                    <div className="pt-3 border-t" style={{ borderColor: "rgba(30,58,95,0.2)" }}>
                      <span className="text-[10px] uppercase tracking-[0.15em] text-kerala-muted/40 font-semibold block mb-2">Connections in the graph</span>
                      <div className="flex flex-wrap gap-2">
                        {catLinks.map((cl) => (
                          <span key={`${cl.a}-${cl.b}`} className="text-[10px] px-2.5 py-1 rounded-full font-medium" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <span style={{ color: M[cl.a].hue }}>{M[cl.a].label}</span>
                            <span className="text-kerala-muted/30 mx-1">{"↔"}</span>
                            <span style={{ color: M[cl.b].hue }}>{M[cl.b].label}</span>
                            <span className="text-kerala-muted/30 ml-1">({cl.count})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {openCat && openC && !selectedLeaf && (
                <div className="p-5 md:p-7 space-y-4" style={{ animation: an("dgFade 0.3s ease") }}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{M[openC.type].icon}</span>
                    <div>
                      <h3 className="font-newsreader text-xl md:text-2xl font-bold text-kerala-white">{M[openC.type].label} in {district.name}</h3>
                      <p className="text-xs text-kerala-muted mt-0.5">{openC.items.length} items &mdash; click any node above for details</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {openC.items.map((item) => (
                      <button key={item.id} className="text-xs px-3 py-1.5 rounded-full font-medium cursor-pointer transition-all duration-300 hover:scale-105 outline-none focus-visible:ring-2 focus-visible:ring-kerala-gold" style={{ background: M[openC.type].bg, color: M[openC.type].hue, border: `1px solid ${M[openC.type].b}` }}
                        onClick={() => setLeafId(item.id)}
                        aria-label={`View details for ${item.label}`}>
                        {item.emoji ? `${item.emoji} ` : ""}{item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedLeaf && openC && (
                <div className="p-5 md:p-7" style={{ animation: an("dgSlideUp 0.35s cubic-bezier(0.32,0.72,0,1)") }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-[0.15em] font-bold" style={{ background: M[openC.type].bg, color: M[openC.type].hue, border: `1px solid ${M[openC.type].b}` }}>
                          {M[openC.type].icon} {M[openC.type].label}
                        </span>
                        {selectedLeaf.issues != null && (
                          <span className="text-[10px] font-semibold text-rose-400/80 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">{"⚠️"} {selectedLeaf.issues} active issues</span>
                        )}
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-newsreader text-xl md:text-2xl font-bold text-kerala-white leading-tight">{selectedLeaf.label}</h3>
                          {selectedLeaf.sub && <span className="text-sm font-malayalam text-kerala-muted/60">{selectedLeaf.sub}</span>}
                        </div>
                        {selectedLeaf.place?.imageUrl && (
                          <div className="shrink-0 w-20 h-20 md:w-28 md:h-28 rounded-xl overflow-hidden">
                            <img src={selectedLeaf.place.imageUrl} alt={selectedLeaf.label} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                        )}
                      </div>

                      {selectedLeaf.desc && (
                        <p className="text-sm text-kerala-muted leading-relaxed max-w-xl">{selectedLeaf.desc}</p>
                      )}

                      {selectedLeaf.place && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {selectedLeaf.place.address && (
                            <div className="flex items-start gap-1.5 text-kerala-muted/70">
                              <span className="shrink-0 mt-0.5">{"\u{1F4CD}"}</span>
                              <span>{selectedLeaf.place.address}</span>
                            </div>
                          )}
                          {selectedLeaf.place.hours && (
                            <div className="flex items-start gap-1.5 text-kerala-muted/70">
                              <span className="shrink-0 mt-0.5">{"\u{1F552}"}</span>
                              <span>{selectedLeaf.place.hours}</span>
                            </div>
                          )}
                          {selectedLeaf.place.phone && (
                            <div className="flex items-start gap-1.5 text-kerala-muted/70">
                              <span className="shrink-0 mt-0.5">{"\u{1F4DE}"}</span>
                              <span>{selectedLeaf.place.phone}</span>
                            </div>
                          )}
                          {selectedLeaf.place.fee && (
                            <div className="flex items-start gap-1.5 text-kerala-muted/70">
                              <span className="shrink-0 mt-0.5">{"\u{1F3F7}️"}</span>
                              <span>{selectedLeaf.place.fee}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedLeaf.hl && selectedLeaf.hl.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-kerala-muted/50">Key Highlights</span>
                          <div className="flex flex-wrap gap-2">
                            {selectedLeaf.hl.map((h) => (
                              <span key={h} className="text-xs px-3 py-1.5 rounded-xl font-medium" style={{ background: "rgba(255,255,255,0.03)", color: "#CBD5E1", border: "1px solid rgba(255,255,255,0.06)" }}>{h}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3">
                        {selectedLeaf.href && (
                          <Link href={selectedLeaf.href} className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wide" style={{ color: M[openC.type].hue }}>
                            View Local Issues {"→"}
                          </Link>
                        )}
                        {selectedLeaf.place?.website && (
                          <a href={selectedLeaf.place.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wide text-kerala-gold/80 hover:text-kerala-gold transition-colors">
                            Visit Website {"↗"}
                          </a>
                        )}
                      </div>
                    </div>

                    <button onClick={() => setLeafId(null)} aria-label="Close detail panel" className="shrink-0 text-kerala-muted hover:text-kerala-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-white/5 transition-colors text-sm mt-1 outline-none focus-visible:ring-2 focus-visible:ring-kerala-gold">{"✕"}</button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* ── List / Card view ── */
          <div className="p-4 md:p-6 space-y-6" style={{ background: "rgba(10,22,40,0.4)" }}>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                <h2 className="font-newsreader text-2xl md:text-3xl font-bold text-kerala-white">{district.name}</h2>
                <span className="font-malayalam text-lg text-kerala-gold/70">{district.malayalamName}</span>
                <span className="text-[10px] uppercase tracking-[0.15em] px-2.5 py-0.5 rounded-full font-bold" style={{ background: "rgba(232,160,32,0.08)", color: "#E8A020", border: "1px solid rgba(232,160,32,0.2)" }}>
                  {district.region} Kerala
                </span>
              </div>
              <p className="text-sm text-kerala-muted max-w-2xl">{district.tagline}</p>
              <div className="flex flex-wrap gap-2">
                {district.famousFor.map((f) => (
                  <span key={f} className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: "rgba(27,107,58,0.1)", color: "#2E8B57", border: "1px solid rgba(27,107,58,0.25)" }}>{"★"} {f}</span>
                ))}
              </div>
            </div>

            {cats.map((cat) => {
              const m = M[cat.type];
              return (
                <div key={cat.type} className="space-y-3" role="region" aria-label={m.label}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{m.icon}</span>
                    <h3 className="font-semibold text-kerala-white text-sm">{m.label}</h3>
                    <span className="text-[10px] text-kerala-muted/50 font-medium">{cat.items.length}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {cat.items.map((item) => (
                      <div key={item.id} className="rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02]" style={{ background: m.bg, border: `1px solid ${m.b}` }}>
                        {item.place?.imageUrl && (
                          <div className="h-32 overflow-hidden">
                            <img src={item.place.imageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                          </div>
                        )}
                        <div className="p-3.5 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-newsreader font-semibold text-kerala-white text-sm leading-tight">{item.label}</h4>
                            {item.emoji && <span className="text-base shrink-0">{item.emoji}</span>}
                          </div>
                          {item.sub && <span className="text-[10px] font-malayalam text-kerala-muted/60 block">{item.sub}</span>}
                          {item.desc && <p className="text-xs text-kerala-muted/80 leading-relaxed line-clamp-3">{item.desc}</p>}
                          {item.place?.address && <p className="text-[10px] text-kerala-muted/50">{"\u{1F4CD}"} {item.place.address}</p>}
                          {item.hl && item.hl.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {item.hl.slice(0, 4).map((h) => (
                                <span key={h} className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.03)", color: "#94A3B8", border: "1px solid rgba(255,255,255,0.06)" }}>{h}</span>
                              ))}
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {item.place?.website && (
                              <a href={item.place.website} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold" style={{ color: m.hue }}>Website {"↗"}</a>
                            )}
                            {item.href && (
                              <Link href={item.href} className="text-[10px] font-bold" style={{ color: m.hue }}>Issues {"→"}</Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes dgPulse { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(2.5); opacity: 0; } }
        @keyframes dgFloat {
          0%, 100% { transform: translate(-50%,-50%) translateY(0); }
          33% { transform: translate(-50%,-50%) translateY(-7px) translateX(4px); }
          66% { transform: translate(-50%,-50%) translateY(5px) translateX(-3px); }
        }
        @keyframes dgEntrance {
          0% { opacity: 0; transform: translate(-50%,-50%) scale(0.3); }
          60% { transform: translate(-50%,-50%) scale(1.08); }
          100% { opacity: 1; transform: translate(-50%,-50%) scale(1); }
        }
        @keyframes dgSpawn {
          0% { opacity: 0; transform: translate(-50%,-50%) scale(0); }
          60% { transform: translate(-50%,-50%) scale(1.08); }
          100% { opacity: 1; transform: translate(-50%,-50%) scale(1); }
        }
        @keyframes dgFade { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes dgRing { 0% { opacity: 0; } 100% { opacity: 0.15; } }
        @keyframes dgSlideUp {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes dgDiscoverPulse {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.4); opacity: 0; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes dgBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }
        @keyframes dgCrossGlow {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </div>
  );
}
