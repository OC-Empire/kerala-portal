import { MOCK_NEWS } from "@/lib/news";
import { DISTRICTS, KERALA_STATS, ALL_SUB_LOCATIONS } from "@/lib/districts";
import { CATEGORY_META } from "@/lib/news";
import { timeAgo } from "@/lib/utils";
import DistrictMap from "@/components/district-map";
import WeatherWidget from "@/components/weather-widget";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function Home() {
  const t = await getTranslations("home");
  const breaking = MOCK_NEWS.filter((n) => n.isBreaking);
  const latest = MOCK_NEWS.slice(0, 6);

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="glass-card p-8 md:p-14 text-center relative overflow-hidden bg-gradient-to-b from-kerala-surface/60 to-kerala-card/80 border-kerala-green/30">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-kerala-green/20 border border-kerala-green/40 text-emerald-300 text-xs font-semibold mb-4">
          <span className="live-dot" />
          <span>{t("badge")}</span>
        </div>

        <h1 className="font-newsreader text-4xl sm:text-5xl md:text-7xl font-bold kerala-text-gradient mb-4 tracking-tight">
          {t("title")}
        </h1>
        <p className="text-kerala-muted text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          {t.rich("intro", {
            b: (chunks) => <strong className="text-kerala-white font-semibold">{chunks}</strong>,
          })}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/districts" className="btn-gold shadow-gold text-sm font-semibold px-6 py-3">
            {t("exploreDistricts")}
          </Link>
          <Link href="/civic" className="btn-primary text-sm font-semibold px-6 py-3">
            {t("reportIssue")}
          </Link>
          <Link href="/tourism" className="px-5 py-3 rounded-xl border border-kerala-border bg-kerala-card/60 hover:bg-kerala-card text-kerala-white text-sm transition-all">
            {t("travelPlanner")}
          </Link>
        </div>
      </section>

      {/* Breaking News Ticker */}
      {breaking.length > 0 && (
        <section className="glass-card p-3.5 border-red-500/30">
          <div className="flex items-center gap-3">
            <span className="live-dot bg-rose-400" />
            <span className="text-rose-400 font-bold text-xs uppercase tracking-wider whitespace-nowrap">
              {t("breakingAlert")}
            </span>
            <div className="ticker-wrap flex-1">
              <span className="ticker-content text-xs md:text-sm text-kerala-white font-medium">
                {breaking.map((b) => b.title).join("  ✦  ")}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* High-Level State Metrics */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: t("stats.population"), value: KERALA_STATS.population, sub: t("stats.populationSub") },
          { label: t("stats.districts"), value: String(KERALA_STATS.districts), sub: t("stats.districtsSub") },
          { label: t("stats.hubs"), value: t("stats.hubsValue", { count: ALL_SUB_LOCATIONS.length }), sub: t("stats.hubsSub") },
          { label: t("stats.literacy"), value: KERALA_STATS.literacyRate, sub: t("stats.literacySub") },
          { label: t("stats.diaspora"), value: KERALA_STATS.nriPopulation, sub: t("stats.diasporaSub") },
          { label: t("stats.tourism"), value: KERALA_STATS.touristArrivals, sub: t("stats.tourismSub") },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4 text-center transition-all hover:border-kerala-gold/50">
            <div className="text-xl md:text-2xl font-bold gold-text-gradient">{s.value}</div>
            <div className="text-xs text-kerala-white font-medium mt-0.5">{s.label}</div>
            <div className="text-[10px] text-kerala-muted">{s.sub}</div>
          </div>
        ))}
      </section>

      {/* Live Weather Widget */}
      <WeatherWidget />

      {/* Living Interactive Map */}
      <DistrictMap />

      {/* Main Grid: Latest News + Hyperlocal Centers Spotlight */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* News Column */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="section-heading text-2xl">{t("newsHeading")}</h2>
            <Link href="/news" className="text-xs text-kerala-gold hover:underline font-semibold">
              {t("viewAllNews")}
            </Link>
          </div>

          <div className="space-y-3.5">
            {latest.map((n) => (
              <article key={n.id} className="glass-card-hover p-5 border-kerala-border hover:border-kerala-green/60">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${CATEGORY_META[n.category].bg} ${CATEGORY_META[n.category].color}`}>
                    {CATEGORY_META[n.category].label}
                  </span>
                  <span className="text-xs text-kerala-gold font-medium">📍 {n.district}</span>
                  <span className="text-xs text-kerala-muted ml-auto">{timeAgo(n.publishedAt)}</span>
                </div>
                <h3 className="font-newsreader text-lg font-bold text-kerala-white">
                  {n.title}
                </h3>
                <p className="text-xs md:text-sm text-kerala-muted mt-1 leading-relaxed">
                  {n.summary}
                </p>
                <div className="text-[11px] text-kerala-muted/80 mt-3 pt-2 border-t border-kerala-border/40 flex justify-between">
                  <span>{t("source", { source: n.source })}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Prime Sub-Hubs Sidebar */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="section-heading text-2xl">{t("hubsHeading")}</h2>
            <Link href="/districts" className="text-xs text-kerala-light hover:underline font-semibold">
              {t("allDistricts")}
            </Link>
          </div>

          <div className="space-y-3">
            {[
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
            ].map((hub) => (
              <Link
                key={hub.name}
                href={`/district/${hub.slug}`}
                className="glass-card-hover p-4 block border-kerala-border"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-kerala-gold/20 text-kerala-gold uppercase">
                    {hub.badge}
                  </span>
                  <span className="text-[11px] text-kerala-muted">{hub.district}</span>
                </div>
                <div className="text-sm font-bold text-kerala-white mt-1.5">{hub.name}</div>
                <div className="text-xs text-kerala-muted mt-1">{hub.desc}</div>
              </Link>
            ))}
          </div>

          <div className="glass-card p-5 border-kerala-gold/40 text-center space-y-2">
            <div className="text-2xl">🌴</div>
            <div className="text-sm font-bold text-kerala-white">{t("civicCardTitle")}</div>
            <p className="text-xs text-kerala-muted">
              {t("civicCardBody")}
            </p>
            <Link href="/civic" className="btn-gold inline-block text-xs py-2 px-4 mt-2 font-semibold">
              {t("civicCardCta")}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
