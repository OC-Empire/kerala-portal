import { useLocale, useTranslations } from "next-intl";
import { safeHref } from "@/lib/safe-url";
import type { PlaceItem } from "@/lib/places-data";

/** Dedicated FOOD block for a district page: dishes, famous restaurants, and profile favourites not already covered. */
export default function DistrictFood({ dishes, restaurants, extras, districtName }: { dishes: PlaceItem[]; restaurants: PlaceItem[]; extras: string[]; districtName: string }) {
  const t = useTranslations("district");
  const locale = useLocale();
  const title = (p: PlaceItem) => (locale === "ml" && p.malayalamName ? p.malayalamName : p.name);
  const sub = (p: PlaceItem) => (locale === "ml" ? (p.malayalamName ? p.name : null) : p.malayalamName);

  return (
    <section id="food" className="space-y-6 scroll-mt-32">
      <div>
        <h2 className="section-heading flex items-center gap-2"><span aria-hidden>🍲</span> {t("foodHeading", { name: districtName })}</h2>
        <p className="text-xs md:text-sm text-kerala-muted">{t("foodNote")}</p>
      </div>

      {dishes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-kerala-gold uppercase tracking-wider">{t("dishesToTry")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {dishes.map((p) => {
              const src = safeHref(p.sourceUrl);
              return (
                <article key={p.id} className="glass-card p-4 flex flex-col gap-1.5">
                  <h4 className="font-newsreader text-lg font-bold text-kerala-white leading-snug">{title(p)}</h4>
                  {sub(p) && <div className="text-xs text-kerala-gold">{sub(p)}</div>}
                  {p.description && <p className="text-sm text-kerala-muted leading-relaxed line-clamp-4">{p.description}</p>}
                  {src && <a href={src} target="_blank" rel="noopener noreferrer" className="text-xs text-kerala-muted hover:text-kerala-white hover:underline mt-auto pt-1">{t("source")} ↗</a>}
                </article>
              );
            })}
          </div>
        </div>
      )}

      {restaurants.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-kerala-gold uppercase tracking-wider">{t("restaurantsHeading")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {restaurants.map((p) => {
              const src = safeHref(p.sourceUrl);
              const site = safeHref(p.website);
              const maps = p.lat != null && p.lng != null ? `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}` : null;
              return (
                <article key={p.id} className="glass-card p-4 flex flex-col gap-1.5 border-kerala-gold/20">
                  <span className="self-start text-[11px] px-2 py-0.5 rounded-full bg-kerala-gold/15 text-kerala-gold font-semibold">🍽️ {t("restaurant")}</span>
                  <h4 className="font-newsreader text-lg font-bold text-kerala-white leading-snug">{title(p)}</h4>
                  {p.address && <div className="text-xs text-kerala-muted">📍 {p.address}</div>}
                  {p.description && <p className="text-sm text-kerala-muted leading-relaxed line-clamp-4">{p.description}</p>}
                  {p.hours && <div className="text-xs text-kerala-muted">🕒 {p.hours}</div>}
                  <div className="flex flex-wrap gap-3 pt-1 mt-auto text-xs">
                    {maps && <a href={maps} target="_blank" rel="noopener noreferrer" className="text-kerala-light hover:underline font-semibold">{t("directions")} ↗</a>}
                    {site && <a href={site} target="_blank" rel="noopener noreferrer" className="text-kerala-light hover:underline font-semibold">{t("website")} ↗</a>}
                    {src && <a href={src} target="_blank" rel="noopener noreferrer" className="text-kerala-muted hover:text-kerala-white hover:underline">{t("source")} ↗</a>}
                  </div>
                </article>
              );
            })}
          </div>
          <p className="text-[11px] text-kerala-muted">{t("restaurantNote")}</p>
        </div>
      )}

      {extras.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-kerala-gold uppercase tracking-wider">{t("moreFood")}</h3>
          <div className="flex flex-wrap gap-2">
            {extras.map((f) => (
              <span key={f} className="px-3.5 py-1.5 rounded-full bg-kerala-green/20 border border-kerala-green/40 text-kerala-light text-sm">{f}</span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
