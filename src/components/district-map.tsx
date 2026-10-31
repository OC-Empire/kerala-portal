"use client";

import { DISTRICTS } from "@/lib/districts";
import Link from "next/link";
import { useState } from "react";

// Normalize lat/lng to SVG coords (Kerala bbox approx)
const LAT_MIN = 8.2, LAT_MAX = 12.8;
const LNG_MIN = 74.8, LNG_MAX = 77.5;

function toXY(lat: number, lng: number) {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 100;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * 100;
  return { x, y };
}

export default function DistrictMap() {
  const [hover, setHover] = useState<string | null>(null);
  const active = DISTRICTS.find((d) => d.slug === hover);

  return (
    <div className="glass-card p-6">
      <h2 className="section-heading mb-4">Kerala District Map</h2>
      <div className="relative w-full" style={{ aspectRatio: "3/4" }}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* outline hint */}
          <rect x="0" y="0" width="100" height="100" fill="none" stroke="#1E3A5F" strokeDasharray="2 2" />
          {DISTRICTS.map((d) => {
            const { x, y } = toXY(d.coordinates.lat, d.coordinates.lng);
            const isHover = hover === d.slug;
            return (
              <g key={d.id}>
                <circle
                  cx={x}
                  cy={y}
                  r={isHover ? 4.5 : 3}
                  fill={d.color}
                  stroke="#F9F5EE"
                  strokeWidth={isHover ? 1.5 : 0.5}
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHover(d.slug)}
                  onMouseLeave={() => setHover(null)}
                />
                {isHover && (
                  <text x={x} y={y - 6} textAnchor="middle" fontSize="3" fill="#F9F5EE" fontWeight="600">
                    {d.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        {active && (
          <div className="absolute bottom-2 left-2 right-2 glass-card p-3">
            <div className="font-semibold text-kerala-white">{active.name}</div>
            <div className="text-xs text-kerala-muted">{active.tagline}</div>
            <Link href={`/district/${active.slug}`} className="text-xs text-kerala-light hover:underline">
              View district →
            </Link>
          </div>
        )}
      </div>
      <p className="text-xs text-kerala-muted mt-3">
        Hover a dot to preview; click "View district" for details.
      </p>
    </div>
  );
}