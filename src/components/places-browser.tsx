"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PLACE_CATEGORIES, placeMeta } from "@/lib/places";
import { safeHref } from "@/lib/safe-url";
import NewsImage from "@/components/news-image";

export interface PlaceView {
  id: string;
  category: string;
  name: string;
  malayalamName: string | null;
  description: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  website: string | null;
  hours: string | null;
  fee: string | null;
  imageUrl: string | null;
  verified: boolean;
}

export default function PlacesBrowser({ places }: { places: PlaceView[] }) {
  const t = useTranslations("district");
  const locale = useLocale();
  const [cat, setCat] = useState<string>("all");

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    places.forEach((p) => m.set(p.category, (m.get(p.category) ?? 0) + 1));
    return m;
  }, [places]);
  const shown = cat === "all" ? places : places.filter((p) => p.category === cat);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label={t("placesFilter")}>
        <button role="tab" aria-selected={cat === "all"} onClick={() => setCat("all")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${cat === "all" ? "bg-kerala-green text-white" : "bg-kerala-card text-kerala-muted hover:text-kerala-white"}`}>
          {t("all")} · {places.length}
        </button>
        {PLACE_CATEGORIES.filter((c) => counts.has(c.key)).map((c) => (
          <button key={c.key} role="tab" aria-selected={cat === c.key} onClick={() => setCat(c.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${cat === c.key ? "bg-kerala-green text-white" : "bg-kerala-card text-kerala-muted hover:text-kerala-white"}`}>
            {c.icon} {c.label} · {counts.get(c.key)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {shown.map((p) => {
          const m = placeMeta(p.category);
          const site = safeHref(p.website);
          const img = safeHref(p.imageUrl);
          const maps = p.lat != null && p.lng != null ? `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}` : null;
          const title = locale === "ml" && p.malayalamName ? p.malayalamName : p.name;
          const sub = locale === "ml" ? (p.malayalamName ? p.name : null) : p.malayalamName;
          return (
            <article key={p.id} className="glass-card overflow-hidden flex flex-col">
              {img?.startsWith("https://") && (
                <div className="h-36 bg-kerala-surface overflow-hidden"><NewsImage src={img} alt="" className="h-full w-full object-cover" /></div>
              )}
              <div className="p-4 flex flex-col gap-1.5 flex-1">
                <span className="self-start text-[11px] px-2 py-0.5 rounded-full bg-kerala-green/20 text-emerald-300 font-semibold">{m.icon} {m.label}</span>
                <h3 className="font-newsreader text-lg font-bold text-kerala-white leading-snug">{title}</h3>
                {sub && <div className="text-xs text-kerala-gold">{sub}</div>}
                {p.description && <p className="text-sm text-kerala-muted leading-relaxed line-clamp-4">{p.description}</p>}
                <dl className="text-xs text-kerala-muted space-y-0.5 mt-1">
                  {p.address && <div>📍 {p.address}</div>}
                  {p.hours && <div>🕒 {p.hours}</div>}
                  {p.fee && <div>🎟️ {p.fee}</div>}
                  {p.phone && <div>📞 {p.phone}</div>}
                </dl>
                <div className="flex flex-wrap gap-3 pt-2 mt-auto text-xs">
                  {maps && <a href={maps} target="_blank" rel="noopener noreferrer" className="text-kerala-light hover:underline font-semibold">{t("directions")} ↗</a>}
                  {site && <a href={site} target="_blank" rel="noopener noreferrer" className="text-kerala-light hover:underline font-semibold">{t("website")} ↗</a>}
                  {!p.verified && <span className="text-kerala-muted/80">{t("unverified")}</span>}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
