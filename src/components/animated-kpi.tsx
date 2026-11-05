"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";

interface KpiItem {
  label: string;
  value: string;
  sub: string;
  live: boolean;
}

function AnimatedNumber({ value }: { value: string }) {
  const num = parseFloat(value);
  const isNumber = !isNaN(num) && isFinite(num);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 60, damping: 20, mass: 1 });

  useEffect(() => {
    if (isInView && isNumber) motionVal.set(num);
  }, [isInView, isNumber, num, motionVal]);

  const display = useTransform(spring, (v) => {
    if (!isNumber) return value;
    if (value.includes("°")) return `${Math.round(v)}°C`;
    if (value.includes("%")) return `${v.toFixed(1)}%`;
    return String(Math.round(v));
  });

  if (!isNumber) return <span ref={ref}>{value}</span>;

  return <motion.span ref={ref}>{display}</motion.span>;
}

export default function AnimatedKPI({ kpis }: { kpis: KpiItem[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {kpis.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={mounted ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ delay: i * 0.08, duration: 0.5, type: "spring", stiffness: 100, damping: 15 }}
          whileHover={{ scale: 1.04, borderColor: "rgba(232, 160, 32, 0.5)" }}
          className="kpi-card glass-card p-4 text-center relative overflow-hidden group"
        >
          {/* Glow ring on live cards */}
          {s.live && (
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ boxShadow: "inset 0 0 24px rgba(232, 160, 32, 0.12), 0 0 32px rgba(27, 107, 58, 0.15)" }}
            />
          )}

          {/* Scan line effect */}
          {s.live && (
            <div className="kpi-scanline absolute inset-0 pointer-events-none opacity-30" />
          )}

          <div className="text-xl md:text-2xl font-bold gold-text-gradient relative z-10 tabular-nums">
            <AnimatedNumber value={s.value} />
          </div>
          <div className="text-xs text-kerala-white font-medium mt-0.5 flex items-center justify-center gap-1.5 relative z-10">
            {s.live && <span className="live-dot scale-75" aria-hidden />}{s.label}
          </div>
          <div className="text-[10px] text-kerala-muted truncate relative z-10">{s.sub}</div>
        </motion.div>
      ))}
    </section>
  );
}
