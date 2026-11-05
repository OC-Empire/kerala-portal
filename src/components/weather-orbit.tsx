"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Cloud, CloudDrizzle, CloudRain, CloudLightning, CloudFog, CloudSun, Droplets, Thermometer } from "lucide-react";

interface WeatherReport {
  district: string;
  temp: number;
  condition: string;
  humidity: number;
  icon: string;
}

const WEATHER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Sunny: Sun, Clear: Moon, "Mostly clear": CloudSun, "Partly cloudy": CloudSun,
  Overcast: Cloud, Fog: CloudFog, Drizzle: CloudDrizzle, Rain: CloudRain,
  "Rain showers": CloudRain, Thunderstorm: CloudLightning, Cloudy: Cloud,
};

function tempColor(temp: number): string {
  if (temp >= 35) return "#ef4444";
  if (temp >= 30) return "#f97316";
  if (temp >= 25) return "#E8A020";
  if (temp >= 20) return "#22c55e";
  return "#38bdf8";
}

function tempGlow(temp: number): string {
  const c = tempColor(temp);
  return `0 0 20px ${c}33, 0 0 40px ${c}15`;
}

export default function WeatherOrbit() {
  const [reports, setReports] = useState<WeatherReport[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/weather")
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => { if (!cancelled && Array.isArray(data.weather)) setReports(data.weather); })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, []);

  // Auto-rotate active city
  useEffect(() => {
    if (!reports || reports.length === 0) return;
    const t = setInterval(() => setActive((p) => (p + 1) % reports.length), 4000);
    return () => clearInterval(t);
  }, [reports]);

  const avg = useMemo(() => {
    if (!reports || reports.length === 0) return 0;
    return Math.round(reports.reduce((a, r) => a + r.temp, 0) / reports.length);
  }, [reports]);

  if (failed) {
    return (
      <div className="glass-card p-5">
        <p role="alert" className="text-sm text-kerala-muted text-center">Weather is temporarily unavailable.</p>
      </div>
    );
  }

  if (!reports) {
    return (
      <div className="glass-card p-8">
        <div className="h-[300px] rounded-2xl bg-kerala-dark/60 animate-pulse" />
      </div>
    );
  }

  const current = reports[active];
  const WeatherIcon = current ? (WEATHER_ICONS[current.condition] ?? Cloud) : Cloud;

  return (
    <div className="glass-card p-5 md:p-8 overflow-hidden relative">
      {/* Background ambient glow */}
      {current && (
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-1000"
          style={{
            background: `radial-gradient(ellipse at center, ${tempColor(current.temp)}08 0%, transparent 70%)`,
          }}
        />
      )}

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <h3 className="text-sm font-semibold text-kerala-white uppercase tracking-wider">
            Kerala Weather
          </h3>
        </div>
        <span className="text-xs text-kerala-muted">Live · Open-Meteo</span>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
        {/* Orbit ring */}
        <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] shrink-0 mx-auto">
          {/* Orbit circle */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320">
            <circle cx="160" cy="160" r="130" fill="none" stroke="var(--kerala-border)" strokeWidth="1" strokeDasharray="4 6" opacity="0.5" />
            {/* Sweep arc */}
            <motion.circle
              cx="160" cy="160" r="130" fill="none"
              stroke="url(#sweep)" strokeWidth="2" strokeLinecap="round"
              strokeDasharray="80 740"
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "160px 160px" }}
            />
            <defs>
              <linearGradient id="sweep">
                <stop offset="0%" stopColor="var(--kerala-gold)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="var(--kerala-gold)" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center — active city */}
          <AnimatePresence mode="wait">
            {current && (
              <motion.div
                key={current.district}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center"
              >
                <span style={{ color: tempColor(current.temp) }}><WeatherIcon className="w-10 h-10 mb-1" aria-hidden /></span>
                <div className="text-3xl font-bold tabular-nums" style={{ color: tempColor(current.temp) }}>
                  {current.temp}°C
                </div>
                <div className="text-sm font-semibold text-kerala-white mt-0.5">{current.district}</div>
                <div className="text-[11px] text-kerala-muted">{current.condition}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Orbiting city nodes */}
          {reports.map((r, i) => {
            const angle = (i / reports.length) * 2 * Math.PI - Math.PI / 2;
            const radius = 130;
            const x = 160 + radius * Math.cos(angle);
            const y = 160 + radius * Math.sin(angle);
            const isActive = i === active;
            return (
              <motion.button
                key={r.district}
                onClick={() => setActive(i)}
                className="absolute flex flex-col items-center gap-0.5 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{ left: `${(x / 320) * 100}%`, top: `${(y / 320) * 100}%` }}
                animate={{
                  scale: isActive ? 1.2 : 1,
                }}
                whileHover={{ scale: 1.25 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                  style={{
                    background: isActive ? `${tempColor(r.temp)}22` : "var(--kerala-card)",
                    border: `2px solid ${isActive ? tempColor(r.temp) : "var(--kerala-border)"}`,
                    boxShadow: isActive ? tempGlow(r.temp) : "none",
                    color: tempColor(r.temp),
                  }}
                >
                  {r.temp}°
                </div>
                <span className={`text-[9px] font-semibold whitespace-nowrap transition-colors ${isActive ? "text-kerala-white" : "text-kerala-muted"}`}>
                  {r.district.length > 8 ? r.district.slice(0, 7) + "…" : r.district}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Stats panel */}
        <div className="flex-1 min-w-0 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-kerala-dark/60 rounded-xl p-3 border border-kerala-border/40">
              <div className="flex items-center gap-1.5 text-kerala-muted text-[11px] mb-1">
                <Thermometer className="w-3.5 h-3.5" aria-hidden /> Avg Temperature
              </div>
              <div className="text-xl font-bold" style={{ color: tempColor(avg) }}>{avg}°C</div>
            </div>
            <div className="bg-kerala-dark/60 rounded-xl p-3 border border-kerala-border/40">
              <div className="flex items-center gap-1.5 text-kerala-muted text-[11px] mb-1">
                <Droplets className="w-3.5 h-3.5" aria-hidden /> Avg Humidity
              </div>
              <div className="text-xl font-bold text-sky-400">
                {Math.round(reports.reduce((a, r) => a + r.humidity, 0) / reports.length)}%
              </div>
            </div>
          </div>

          {/* All cities list */}
          <div className="space-y-1.5">
            {reports.map((r, i) => {
              const WeatherI = WEATHER_ICONS[r.condition] ?? Cloud;
              const isA = i === active;
              return (
                <motion.button
                  key={r.district}
                  onClick={() => setActive(i)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer text-left ${isA ? "bg-kerala-surface border border-kerala-border" : "hover:bg-kerala-dark/40"}`}
                  animate={isA ? { x: 4 } : { x: 0 }}
                >
                  <span style={{ color: tempColor(r.temp) }}><WeatherI className="w-5 h-5 shrink-0" aria-hidden /></span>
                  <span className={`text-sm font-medium flex-1 ${isA ? "text-kerala-white" : "text-kerala-muted"}`}>{r.district}</span>
                  <span className="text-sm font-bold tabular-nums" style={{ color: tempColor(r.temp) }}>{r.temp}°C</span>
                  <span className="text-[11px] text-kerala-muted tabular-nums w-10 text-right">{r.humidity}%</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
