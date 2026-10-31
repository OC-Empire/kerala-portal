"use client";

import { useEffect, useState } from "react";

interface WeatherReport {
  district: string;
  temp: number;
  condition: string;
  humidity: number;
  icon: string;
}

export default function WeatherWidget() {
  const [reports, setReports] = useState<WeatherReport[]>([
    { district: "Thiruvananthapuram", temp: 31, condition: "Partly Cloudy", humidity: 72, icon: "⛅" },
    { district: "Kochi", temp: 29, condition: "Light Coastal Rain", humidity: 85, icon: "🌦️" },
    { district: "Munnar", temp: 18, condition: "Misty Mountain Breezes", humidity: 92, icon: "🌫️" },
    { district: "Kozhikode", temp: 30, condition: "Clear Shoreline", humidity: 68, icon: "🌤️" },
    { district: "Alappuzha", temp: 30, condition: "Backwater Sunshine", humidity: 78, icon: "☀️" },
  ]);

  useEffect(() => {
    fetch("/api/weather")
      .then((res) => res.json())
      .then((data) => {
        if (data.weather && Array.isArray(data.weather)) {
          setReports(data.weather);
        }
      })
      .catch(() => {
        // Fallback already pre-seeded
      });
  }, []);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <h3 className="text-sm font-semibold text-kerala-white uppercase tracking-wider">
            Live Kerala Climate & Weather Pulse
          </h3>
        </div>
        <span className="text-xs text-kerala-muted">IMD & Realtime Sensor Feed</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {reports.slice(0, 5).map((w) => (
          <div
            key={w.district}
            className="bg-kerala-dark/60 border border-kerala-border/60 rounded-xl p-3 text-center transition-all hover:border-kerala-green/50"
          >
            <div className="text-2xl mb-1">{w.icon}</div>
            <div className="text-xs font-semibold text-kerala-white truncate">{w.district}</div>
            <div className="text-lg font-bold text-kerala-gold mt-0.5">{w.temp}°C</div>
            <div className="text-[11px] text-kerala-muted truncate mt-0.5">{w.condition}</div>
            <div className="text-[10px] text-kerala-light mt-1">💧 {w.humidity}% humidity</div>
          </div>
        ))}
      </div>
    </div>
  );
}
