import type { Metadata } from "next";
import { DISTRICTS } from "@/lib/districts";
import TourismPlanner from "@/components/tourism-planner";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tourism & Travel Engine — Kerala Portal",
  description: "Discover destinations, plan curated itineraries, and explore attractions across all 14 Kerala districts.",
};

export default function TourismPage() {
  return (
    <div className="space-y-10">
      <div className="glass-card p-6 md:p-10 text-center">
        <span className="text-xs uppercase tracking-widest text-kerala-gold font-bold">
          God's Own Country Travel Hub
        </span>
        <h1 className="font-newsreader text-4xl md:text-5xl font-bold kerala-text-gradient mt-2 mb-3">
          Explore Kerala's Living Atlas
        </h1>
        <p className="text-kerala-muted text-base md:text-lg max-w-2xl mx-auto">
          From the mist-clad tea plantations of Munnar to the pristine backwaters of Alappuzha and the prehistoric caves of Wayanad.
        </p>
      </div>

      {/* Interactive AI Itinerary Planner Component */}
      <TourismPlanner />

      {/* District Directory Grid */}
      <div className="space-y-4">
        <h2 className="section-heading">Explore Tourism Spots by District</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DISTRICTS.map((d) => (
            <div key={d.id} className="glass-card-hover p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-newsreader text-xl font-semibold text-kerala-white">{d.name}</h3>
                  <span className="text-xs text-kerala-gold">{d.region.toUpperCase()}</span>
                </div>
                <p className="text-xs text-kerala-muted mb-3 italic">{d.tagline}</p>
                <ul className="space-y-2">
                  {d.touristSpots.map((t) => (
                    <li key={t.name} className="text-xs text-kerala-muted flex items-start gap-2">
                      <span className="text-base leading-none">{t.emoji}</span>
                      <div>
                        <strong className="text-kerala-white font-medium">{t.name}</strong>
                        <p className="text-[11px] text-kerala-muted line-clamp-1">{t.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 pt-3 border-t border-kerala-border/40">
                <Link
                  href={`/district/${d.slug}`}
                  className="text-xs text-kerala-light hover:underline font-medium"
                >
                  View full district guide & sub-hubs →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
