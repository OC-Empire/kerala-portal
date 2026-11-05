"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Cloud, CloudDrizzle, CloudRain, CloudLightning, CloudFog, CloudSun, Droplets } from "lucide-react";

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

export default function WeatherWidget() {
  const [reports, setReports] = useState<WeatherReport[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/weather")
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => { if (!cancelled && Array.isArray(data.weather)) setReports(data.weather); })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <h3 className="text-sm font-semibold text-kerala-white uppercase tracking-wider">
            Kerala Weather Right Now
          </h3>
        </div>
        <span className="text-xs text-kerala-muted">Live data · Open-Meteo</span>
      </div>

      {failed && <p role="alert" className="text-sm text-kerala-muted">Weather is temporarily unavailable.</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {!reports && !failed && Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-[118px] rounded-xl bg-kerala-dark/60 border border-kerala-border/40 animate-pulse" />
        ))}
        {(reports ?? []).slice(0, 5).map((w) => {
          const WeatherIcon = WEATHER_ICONS[w.condition] ?? Cloud;
          return (
            <div
              key={w.district}
              className="bg-kerala-dark/60 border border-kerala-border/60 rounded-xl p-3 text-center transition-all hover:border-kerala-green/50"
            >
              <WeatherIcon className="w-7 h-7 text-kerala-gold mx-auto mb-1" aria-hidden />
              <div className="text-xs font-semibold text-kerala-white truncate">{w.district}</div>
              <div className="text-lg font-bold text-kerala-gold mt-0.5">{w.temp}°C</div>
              <div className="text-[11px] text-kerala-muted truncate mt-0.5">{w.condition}</div>
              <div className="text-[10px] text-kerala-light mt-1 flex items-center justify-center gap-0.5">
                <Droplets className="w-3 h-3" aria-hidden /> {w.humidity}% humidity
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
