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
  // researched food/culture entries live in the Places browser; keep the profile lists only for names they don't cover
  const extraFood = uncovered(d.signatureFood, places.filter((p) => p.category === "food").map((p) => p.name));
  const extraCulture = uncovered(d.culturalIcons, places.filter((p) => p.category === "culture").map((p) => p.name));
  const dishes = places.filter((p) => p.category === "food");
  const restaurants = places.filter((p) => p.category === "restaurant");
  const hasFood = dishes.length + restaurants.length + extraFood.length > 0;
  const browsePlaces = places.filter((p) => p.category !== "food" && p.category !== "restaurant");
  const cultureMore = places.some((p) => p.category === "culture");

  const sections = [
    { id: "overview", label: t("navOverview"), show: true },
    { id: "food", label: t("navFood"), show: hasFood },
    { id: "places", label: t("navPlaces"), show: browsePlaces.length > 0 },
    { id: "events", label: t("navEvents"), show: hasEvents },
    { id: "news", label: t("navNews"), show: news.length > 0 },
    { id: "culture", label: t("navCulture"), show: extraCulture.length > 0 },
    { id: "civic", label: t("navCivic"), show: true },
  ].filter((x) => x.show);

  return (
    <div className="space-y-10">
      {/* District Hero */}
      <div id="overview" className={`glass-card p-6 md:p-10 relative overflow-hidden bg-gradient-to-br ${d.accentBg}`}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <Link href="/districts" className="text-kerala-muted text-sm hover:text-kerala-white transition-colors">
            ← All 14 Districts
          </Link>
          <span className="text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 text-kerala-gold font-semibold">
            {d.region.toUpperCase()} KERALA REGION
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 mt-2">
          <h1 className="font-newsreader text-4xl md:text-6xl font-bold text-kerala-white">
            {d.name}
          </h1>
          <span className="font-malayalam text-2xl md:text-3xl text-kerala-gold font-semibold">
            {d.malayalamName}
          </span>
        </div>
        <p className="text-kerala-muted text-lg mt-2 max-w-2xl">{d.tagline}</p>

        {/* Quick District Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
          {[
            { label: "District Capital", value: d.capital, icon: "🏛️" },
            { label: "Population", value: d.population, icon: "👥" },
            { label: "Land Area", value: d.area, icon: "🗺️" },
            { label: "Prime Sub-Hubs", value: `${d.subLocations.length} Key Centers`, icon: "📍" },
          ].map((s) => (
            <div key={s.label} className="bg-kerala-card/80 border border-kerala-border/60 rounded-xl p-4">
              <div className="text-lg mb-1">{s.icon}</div>
              <div className="text-xs text-kerala-muted">{s.label}</div>
              <div className="text-base font-semibold text-kerala-white mt-0.5">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section nav: only sections that exist */}
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

      {/* Sub-Locations & Localities Deep Dive (Hyperlocal section) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="section-heading">Prime Hubs & Localities in {d.name}</h2>
            <p className="text-xs md:text-sm text-kerala-muted">
              Hyperlocal breakdown of major IT corridors, coastal ports, hill towns & cultural centers.
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-kerala-green/20 text-emerald-400 font-medium">
            Granular Ward & Hub Layer
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {d.subLocations.map((sub) => (
            <div
              key={sub.id}
              className="glass-card-hover p-5 border-kerala-border hover:border-kerala-gold/60 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-white/5 text-kerala-gold">
                    {sub.type.replace("_", " ")}
                  </span>
                  <span className="text-xs text-rose-400">
                    ⚠️ {sub.activeIssuesCount} issues
                  </span>
                </div>
                <h3 className="font-newsreader text-xl font-bold text-kerala-white mt-2">
                  {sub.name}
                </h3>
                <div className="text-xs text-kerala-muted font-malayalam">{sub.malayalamName}</div>
                <p className="text-xs text-kerala-muted mt-2 italic">{sub.tagline}</p>

                <div className="mt-4 space-y-1">
                  <span className="text-[11px] font-semibold text-kerala-light uppercase">Key Centers:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {sub.highlights.map((h) => (
                      <span key={h} className="text-[11px] px-2 py-0.5 rounded bg-kerala-dark/80 text-kerala-muted">
                        • {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-kerala-border/40 flex items-center justify-between">
                <Link
                  href={`/civic?district=${d.slug}`}
                  className="text-xs text-kerala-gold hover:underline"
                >
                  View Local Issues →
                </Link>
                <Link
                  href={`/tourism`}
                  className="text-xs text-kerala-light hover:underline"
                >
                  Explore Spots →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Famous For & Badges */}
      <section className="glass-card p-6">
        <h2 className="section-heading text-xl mb-3">District Identity & GI Hallmarks</h2>
        <div className="flex flex-wrap gap-2">
          {d.famousFor.map((f) => (
            <span key={f} className="px-3.5 py-1.5 rounded-full bg-kerala-green/20 border border-kerala-green/40 text-kerala-light text-sm font-medium">
              ★ {f}
            </span>
          ))}
        </div>
      </section>

      {/* Tourist Attractions */}
      <section className="space-y-4">
        <h2 className="section-heading">Must-Visit Destinations in {d.name}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {d.touristSpots.map((t) => (
            <div key={t.name} className="glass-card-hover p-6">
              <div className="text-3xl mb-3">{t.emoji}</div>
              <h3 className="font-newsreader text-xl font-semibold text-kerala-white">{t.name}</h3>
              <p className="text-sm text-kerala-muted mt-2 leading-relaxed">{t.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Food & Cultural Heritage */}
      {extraCulture.length > 0 && (
      <div className="grid md:grid-cols-2 gap-6">

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
      </div>
      )}
    </div>
  );
}
