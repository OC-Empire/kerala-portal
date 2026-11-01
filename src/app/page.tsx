import { Suspense } from "react";
import { cookies } from "next/headers";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getLiveNews, type Locale } from "@/lib/feeds";
import { getCivicSummary } from "@/lib/civic-data";
import { getWeather } from "@/lib/weather";
import DistrictMap from "@/components/district-map";
import LatestNews from "@/components/latest-news";
import WeatherWidget from "@/components/weather-widget";
import SearchBox from "@/components/search-box";
import DailyBrief, { DailyBriefSkeleton } from "@/components/daily-brief";
import { KERALA_STATS } from "@/lib/districts";

const HUBS = [
              {
                name: "Kazhakootam & Technopark",
                district: "Thiruvananthapuram",
                slug: "thiruvananthapuram",
                desc: "Kerala's Silicon Valley, Taurus Downtown, NH-66 corridor",
                badge: "IT Capital",
              },
              {
                name: "Kakkanad & Infopark",
                district: "Ernakulam",
                slug: "ernakulam",
                desc: "SmartCity Kochi, Electric Water Metro terminal",
                badge: "Commercial Hub",
              },
              {
                name: "Munnar Tea Town",
                district: "Idukki",
                slug: "idukki",
                desc: "High altitude tea estates, Nilgiri Tahr sanctuary",
                badge: "Crown Hills",
              },
              {
                name: "Kuttanad Waterways",
                district: "Alappuzha",
                slug: "alappuzha",
                desc: "1.2m below sea level farming, houseboat canal networks",
                badge: "Backwaters",
              },
              {
                name: "SM Street (Mittayi Theruvu)",
                district: "Kozhikode",
                slug: "kozhikode",
                desc: "Century-old Halwa bazaar, UNESCO City of Literature",
                badge: "Heritage Market",
              },
              {
                name: "Thalassery Coastal Hub",
                district: "Kannur",
                slug: "kannur",
                desc: "Cricket, Circus & Cake cradle; Theyyam fire rituals",
                badge: "Theyyam Heartland",
              },
            ];

export default async function Home() {
  const locale: Locale = (await cookies()).get("NEXT_LOCALE")?.value === "ml" ? "ml" : "en";
  const [news, civic, weather] = await Promise.all([getLiveNews(locale), getCivicSummary(), getWeather()]);
  const t = await getTranslations("home");
  const k = await getTranslations("kpi");
  const ticker = news.slice(0, 4);

  // per-district story counts + newest headlines for the map
  const counts: Record<string, number> = {};
  const headlines: Record<string, { id: string; title: string }[]> = {};
  for (const n of news) {
    if (!n.districtSlug) continue;
    counts[n.districtSlug] = (counts[n.districtSlug] ?? 0) + 1;
    (headlines[n.districtSlug] ??= []).push({ id: n.id, title: n.title }); // news is newest-first
  }

  const last24h = news.filter((n) => Date.now() - +new Date(n.publishedAt) < 24 * 3600_000).length;
  const hottest = [...weather].sort((a, b) => b.temp - a.temp)[0];
  const coolest = [...weather].sort((a, b) => a.temp - b.temp)[0];

  const kpis = [
    { label: k("stories"), value: String(last24h), sub: k("storiesSub"), live: true },
    { label: k("issues"), value: String(civic.openTotal), sub: k("issuesSub"), live: true },
    { label: k("hottest"), value: hottest ? `${hottest.temp}°C` : "—", sub: hottest?.district ?? k("unavailable"), live: true },
    { label: k("coolest"), value: coolest ? `${coolest.temp}°C` : "—", sub: coolest?.district ?? k("unavailable"), live: true },
    { label: k("literacy"), value: KERALA_STATS.literacyRate, sub: k("literacySub"), live: false },
    { label: k("districts"), value: String(KERALA_STATS.districts), sub: k("districtsSub"), live: false },
  ];

  return (
    <div className="space-y-8">
      {/* Compact hero + search */}
      <section className="glass-card px-5 py-8 md:py-10 text-center relative bg-gradient-to-b from-kerala-surface/60 to-kerala-card/80 border-kerala-green/30">
        <h1 className="font-newsreader text-4xl md:text-5xl font-bold kerala-text-gradient tracking-tight">{t("title")}</h1>
        <p className="text-kerala-muted text-sm md:text-base max-w-2xl mx-auto mt-2 mb-5">{t("tagline")}</p>
        <SearchBox />
        <div className="mt-5 flex flex-wrap justify-center gap-2.5">
          <Link href="/districts" className="btn-gold shadow-gold text-xs md:text-sm font-semibold px-4 py-2">{t("exploreDistricts")}</Link>
          <Link href="/civic" className="btn-primary text-xs md:text-sm font-semibold px-4 py-2">{t("reportIssue")}</Link>
          <Link href="/tourism" className="px-4 py-2 rounded-xl border border-kerala-border bg-kerala-card/60 hover:bg-kerala-card text-kerala-white text-xs md:text-sm transition-all">{t("travelPlanner")}</Link>
        </div>
      </section>

      {/* Live headlines ticker */}
      {ticker.length > 0 && (
        <section className="glass-card p-3.5 border-kerala-gold/30">
          <div className="flex items-center gap-3">
            <span className="live-dot" />
            <span className="text-kerala-gold font-bold text-xs uppercase tracking-wider whitespace-nowrap">{t("liveHeadlines")}</span>
            <div className="ticker-wrap flex-1">
              <span className="ticker-content text-xs md:text-sm text-kerala-white font-medium">
                {ticker.map((b, i) => (
                  <span key={b.id}>
                    {i > 0 && <span className="mx-3 text-kerala-gold">✦</span>}
                    <Link href={`/news/${b.id}`} className="hover:text-kerala-gold transition-colors">{b.title}</Link>
                  </span>
                ))}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* AI daily brief (streams in; hidden if AI is unavailable) */}
      <Suspense fallback={<DailyBriefSkeleton />}>
        <DailyBrief news={news} locale={locale} />
      </Suspense>

      {/* KPI strip: live tiles first, reference tiles last */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((s) => (
          <div key={s.label} className="glass-card p-4 text-center transition-all hover:border-kerala-gold/50">
            <div className="text-xl md:text-2xl font-bold gold-text-gradient">{s.value}</div>
            <div className="text-xs text-kerala-white font-medium mt-0.5 flex items-center justify-center gap-1.5">
              {s.live && <span className="live-dot scale-75" aria-hidden />}{s.label}
            </div>
            <div className="text-[10px] text-kerala-muted truncate">{s.sub}</div>
          </div>
        ))}
      </section>

      {/* Map */}
      <DistrictMap counts={counts} headlines={headlines} civicCounts={civic.openByDistrict} civicTop={civic.topByDistrict} />

      {/* Live news */}
      <LatestNews items={news} />

      {/* Weather */}
      <WeatherWidget />

      {/* Places to explore (curated reference, with live counts) */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="section-heading text-2xl">{t("hubsHeading")}</h2>
            <p className="text-xs text-kerala-muted mt-1">{t("hubsNote")}</p>
          </div>
          <Link href="/districts" className="text-xs text-kerala-light hover:underline font-semibold">{t("allDistricts")}</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {HUBS.map((hub) => {
            const stories = counts[hub.slug] ?? 0;
            const issues = civic.openByDistrict[hub.slug] ?? 0;
            return (
              <Link key={hub.name} href={`/district/${hub.slug}`} className="glass-card-hover p-4 block border-kerala-border">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-kerala-gold/20 text-kerala-gold uppercase">{hub.badge}</span>
                  <span className="text-[11px] text-kerala-muted">{hub.district}</span>
                </div>
                <div className="text-sm font-bold text-kerala-white mt-1.5">{hub.name}</div>
                <div className="text-xs text-kerala-muted mt-1">{hub.desc}</div>
                <div className="text-[11px] text-kerala-light mt-2.5 pt-2 border-t border-kerala-border/40">
                  {t("hubCounts", { stories, issues })}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Civic CTA */}
      <section className="glass-card p-6 border-kerala-gold/40 text-center space-y-2">
        <div className="text-2xl">🌴</div>
        <div className="text-sm font-bold text-kerala-white">{t("civicCardTitle")}</div>
        <p className="text-xs text-kerala-muted">{t("civicCardBody", { open: civic.openTotal })}</p>
        <Link href="/civic" className="btn-gold inline-block text-xs py-2 px-4 mt-2 font-semibold">{t("civicCardCta")}</Link>
      </section>
    </div>
  );
}
