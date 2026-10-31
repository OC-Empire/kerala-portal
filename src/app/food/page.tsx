import type { Metadata } from "next";
import { DISTRICTS } from "@/lib/districts";

export const metadata: Metadata = {
  title: "Food & Culture — Kerala Portal",
  description: "Signature dishes and cultural icons from every Kerala district.",
};

export default function FoodPage() {
  return (
    <div className="space-y-6">
      <h1 className="section-heading">Food & Culture</h1>
      <p className="text-kerala-muted">Signature dishes and cultural icons from every district.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {DISTRICTS.map((d) => (
          <div key={d.id} className="glass-card p-5">
            <h2 className="font-newsreader text-xl font-semibold text-kerala-white mb-2">{d.name}</h2>
            <div className="mb-3">
              <div className="text-xs text-kerala-gold mb-1">Signature Food</div>
              <div className="flex flex-wrap gap-1">
                {d.signatureFood.map((f) => (
                  <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-kerala-gold/20 text-kerala-gold">
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-kerala-light mb-1">Cultural Icons</div>
              <div className="flex flex-wrap gap-1">
                {d.culturalIcons.map((c) => (
                  <span key={c} className="text-xs px-2 py-0.5 rounded-full bg-kerala-green/20 text-kerala-light">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}