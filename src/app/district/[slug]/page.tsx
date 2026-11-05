import { DISTRICT_BY_SLUG } from "@/lib/districts";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { getLiveNews, type Locale } from "@/lib/feeds";
import { getCivicSummary } from "@/lib/civic-data";
import { getPlaces } from "@/lib/places-data";
import { getUndatedEvents, getUpcomingEvents } from "@/lib/events-data";
import PlacesBrowser from "@/components/places-browser";
import DistrictFood from "@/components/district-food";
import EventCard from "@/components/event-card";
import NewsImage from "@/components/news-image";
import DistrictGraph from "@/components/district-graph";
import { timeAgo } from "@/lib/utils";
import { uncovered } from "@/lib/dedupe";

export default async function DistrictPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ cat?: string }> }) {
  const { slug } = await params;
  const { cat: initialCat } = await searchParams;
  const d = DISTRICT_BY_SLUG[slug];
  if (!d) notFound();

  const locale: Locale = (await cookies()).get("NEXT_LOCALE")?.value === "ml" ? "ml" : "en";
  const t = await getTranslations("district");
  const [places, upcoming, undated, allNews, civic] = await Promise.all([
    getPlaces(slug),
    getUpcomingEvents({ district: slug, limit: 12 }),
    getUndatedEvents({ district: slug }),
    getLiveNews(locale),
    getCivicSummary(),
  ]);
  const news = allNews.filter((n) => n.districtSlug === slug).slice(0, 4);
  const issues = civic.topByDistrict[slug] ?? [];
  const hasEvents = upcoming.length + undated.length > 0;
  const extraFood = uncovered(d.signatureFood, places.filter((p) => p.category === "food").map((p) => p.name));
  const extraCulture = uncovered(d.culturalIcons, places.filter((p) => p.category === "culture").map((p) => p.name));
  const dishes = places.filter((p) => p.category === "food");
  const restaurants = places.filter((p) => p.category === "restaurant");
  const hasFood = dishes.length + restaurants.length + extraFood.length > 0;
  const browsePlaces = places.filter((p) => p.category !== "food" && p.category !== "restaurant");
  const cultureMore = places.some((p) => p.category === "culture");

  const sections = [
    { id: "explore", label: "Explore", show: true },
    { id: "food", label: t("navFood"), show: hasFood },
    { id: "places", label: t("navPlaces"), show: browsePlaces.length > 0 },
    { id: "events", label: t("navEvents"), show: hasEvents },
    { id: "news", label: t("navNews"), show: news.length > 0 },
    { id: "culture", label: t("navCulture"), show: extraCulture.length > 0 },
    { id: "civic", label: t("navCivic"), show: true },
  ].filter((x) => x.show);

  return (
    <div className="space-y-10">
      {/* Back link + region tag */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/districts" className="text-kerala-muted text-sm hover:text-kerala-white transition-colors">
          ← All Districts
        </Link>
        <span className="text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full font-bold" style={{ background: "rgba(232,160,32,0.06)", color: "#E8A020", border: "1px solid rgba(232,160,32,0.15)" }}>
          {d.region} Kerala
        </span>
      </div>

      {/* ── Interactive Graph Hero — the main attraction ── */}
      <section id="explore" className="scroll-mt-20">
        <DistrictGraph district={d} initialCat={initialCat} places={places.map((p) => ({
          name: p.name, category: p.category, description: p.description,
          address: p.address, imageUrl: p.imageUrl, website: p.website,
          phone: p.phone, hours: p.hours, fee: p.fee,
        }))} />
      </section>

      {/* Section nav */}
      <nav aria-label={t("sections")} className="sticky top-16 z-30 -mt-4 overflow-x-auto">
        <div className="inline-flex gap-1 rounded-full border border-kerala-border bg-kerala-dark/90 backdrop-blur p-1 text-xs">
          {sections.map((x) => (
            <a key={x.id} href={`#${x.id}`} className="px-3.5 py-1.5 rounded-full font-semibold text-kerala-muted hover:text-kerala-white hover:bg-kerala-card transition-colors whitespace-nowrap">
              {x.label}
            </a>
          ))}
        </div>
      </nav>

      {hasFood && <DistrictFood dishes={dishes} restaurants={restaurants} extras={extraFood} districtName={d.name} />}

      {browsePlaces.length > 0 && (
        <section id="places" className="space-y-4 scroll-mt-32">
          <div>
            <h2 className="section-heading">{t("placesHeading", { name: d.name })}</h2>
            <p className="text-xs md:text-sm text-kerala-muted">{t("placesNote")}</p>
          </div>
          <PlacesBrowser
            initialCat={initialCat}
            places={browsePlaces.map((p) => ({
              id: p.id, category: p.category, name: p.name, malayalamName: p.malayalamName, description: p.description,
              address: p.address, lat: p.lat, lng: p.lng, phone: p.phone, website: p.website, hours: p.hours, fee: p.fee,
              imageUrl: p.imageUrl, verified: p.verified, sourceUrl: p.sourceUrl,
            }))}
          />
          <p className="text-[11px] text-kerala-muted">{t("sourceNote")}</p>
        </section>
      )}

      {hasEvents && (
        <section id="events" className="space-y-4 scroll-mt-32">
          <h2 className="section-heading">{t("eventsHeading", { name: d.name })}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...upcoming, ...undated].map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        </section>
      )}

      {news.length > 0 && (
        <section id="news" className="space-y-4 scroll-mt-32">
          <div className="flex items-end justify-between">
            <h2 className="section-heading flex items-center gap-2"><span className="live-dot" /> {t("newsHeading", { name: d.name })}</h2>
            <Link href="/news" className="text-xs text-kerala-gold hover:underline font-semibold">{t("allNews")} →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {news.map((n) => (
              <Link key={n.id} href={`/news/${n.id}`} className="group glass-card-hover p-3 flex gap-3 items-center">
                {n.imageUrl ? <NewsImage src={n.imageUrl} alt="" className="h-16 w-24 shrink-0 rounded-lg object-cover" /> : <div className="h-16 w-24 shrink-0 rounded-lg bg-kerala-surface flex items-center justify-center text-xl">📰</div>}
                <div className="min-w-0">
                  <h3 className="font-newsreader text-sm font-semibold text-kerala-white leading-snug line-clamp-2 group-hover:text-kerala-gold transition-colors">{n.title}</h3>
                  <div className="text-[11px] text-kerala-muted mt-1">{n.source} · {timeAgo(n.publishedAt)}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {extraCulture.length > 0 && (
        <section id="culture" className="glass-card p-6 space-y-4 scroll-mt-32">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎭</span>
            <h2 className="section-heading text-xl">{cultureMore ? t("moreCulture") : "Cultural Icons & Heritage"}</h2>
          </div>
          <p className="text-xs text-kerala-muted">Ritual arts, folklore, and historical movements born in this soil.</p>
          <ul className="space-y-2.5">
            {extraCulture.map((c) => (
              <li key={c} className="bg-kerala-dark/60 border border-kerala-border/60 rounded-xl p-3 text-sm text-kerala-white flex items-center gap-2">
                <span className="text-kerala-light">✦</span> {c}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id="civic" className="space-y-4 scroll-mt-32">
        <h2 className="section-heading">{t("civicHeading", { name: d.name })}</h2>
        {issues.length > 0 ? (
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {issues.map((i) => (
              <li key={i.id}>
                <Link href="/civic" className="glass-card-hover p-4 flex gap-3 items-start h-full">
                  <span className="shrink-0 text-[11px] font-bold text-rose-300 bg-rose-900/40 rounded px-1.5 py-0.5">▲ {i.upvotes}</span>
                  <span className="text-sm font-semibold text-kerala-white leading-snug">{i.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-kerala-muted">{t("noIssues")}</p>
        )}
        <Link href="/civic" className="btn-primary inline-block text-sm font-semibold px-5 py-2.5">{t("reportIssue")}</Link>
      </section>
    </div>
  );
}
