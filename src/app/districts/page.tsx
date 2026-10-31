import type { Metadata } from "next";
import { DISTRICTS } from "@/lib/districts";

export const metadata: Metadata = {
  title: "Districts — Kerala Portal",
  description: "Explore all 14 districts of Kerala with tourist spots, food, and culture.",
};
import Link from "next/link";

export default function DistrictsPage() {
  return (
    <div className="space-y-6">
      <h1 className="section-heading">All 14 Districts of Kerala</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DISTRICTS.map((d) => (
          <Link key={d.id} href={`/district/${d.slug}`} className="glass-card-hover p-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-newsreader text-xl font-semibold text-kerala-white">{d.name}</h2>
              <span className="text-xs text-kerala-muted">{d.malayalamName}</span>
            </div>
            <p className="text-sm text-kerala-muted mb-3">{d.tagline}</p>
            <div className="flex flex-wrap gap-1">
              {d.famousFor.slice(0, 3).map((f) => (
                <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-kerala-green/20 text-kerala-light">
                  {f}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}