import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { getSportsNews, type Locale } from "@/lib/feeds";
import { getUndatedEvents, getUpcomingEvents } from "@/lib/events-data";
import EventCard from "@/components/event-card";
import NewsThumb from "@/components/news-thumb";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sports — Kerala Portal",
  description: "Kerala sports events, the annual calendar, and the latest sports news.",
};

const TABS = ["kerala", "cricket", "football", "all"] as const;
type Tab = (typeof TABS)[number];

export default async function SportsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab: rawTab } = await searchParams;
  const tab: Tab = (TABS as readonly string[]).includes(rawTab ?? "") ? (rawTab as Tab) : "kerala";
  const locale: Locale = (await cookies()).get("NEXT_LOCALE")?.value === "ml" ? "ml" : "en";
  const t = await getTranslations("sports");

  const [upcoming, calendar, allNews] = await Promise.all([
    getUpcomingEvents({ category: "sports", limit: 12 }),
    getUndatedEvents({ category: "sports" }),
    getSportsNews(locale),
  ]);

  const news = allNews.filter((n) => (tab === "all" ? true : tab === "kerala" ? n.kerala : n.sport === tab));

  return (
    <div className="space-y-10">
      <header className="glass-card p-6 md:p-8 bg-gradient-to-br from-kerala-surface/70 to-kerala-card/80 border-kerala-green/30">
        <h1 className="font-newsreader text-3xl md:text-4xl font-bold kerala-text-gradient">🏆 {t("title")}</h1>
        <p className="text-sm md:text-base text-kerala-muted mt-2 max-w-2xl">{t("subtitle")}</p>
      </header>

      {/* Upcoming dated events */}
      {upcoming.length > 0 && (
        <section className="space-y-4">
          <h2 className="section-heading text-2xl">{t("upcoming")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcoming.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        </section>
      )}

      {/* Annual calendar (recurring / dates not fixed) */}
      {calendar.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="section-heading text-2xl">{t("calendar")}</h2>
            <p className="text-xs text-kerala-muted mt-1">{t("calendarNote")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {calendar.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        </section>
      )}

      {upcoming.length === 0 && calendar.length === 0 && (
        <section className="glass-card p-6 text-center text-sm text-kerala-muted">{t("noEvents")}</section>
      )}

      {/* News */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="section-heading text-2xl flex items-center gap-2"><span className="live-dot" /> {t("news")}</h2>
          <div role="tablist" aria-label={t("news")} className="inline-flex flex-wrap gap-1 rounded-full border border-kerala-border bg-kerala-dark/60 p-1 text-xs">
            {TABS.map((k) => (
              <Link
                key={k}
                href={`/sports?tab=${k}`}
                scroll={false}
                role="tab"
                aria-selected={tab === k}
                className={`px-3.5 py-1.5 rounded-full font-semibold transition-all ${tab === k ? "bg-kerala-green text-white shadow" : "text-kerala-muted hover:text-kerala-white"}`}
              >
                {t(`tab_${k}`)}
              </Link>
            ))}
          </div>
        </div>

        {news.length === 0 ? (
          <p className="text-sm text-kerala-muted">{allNews.length === 0 ? t("newsUnavailable") : t("noNewsInTab")}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {news.slice(0, 18).map((n) => (
              <Link key={n.id} href={`/news/${n.id}`} className="group glass-card-hover overflow-hidden flex flex-col">
                {n.imageUrl && <NewsThumb src={n.imageUrl} />}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-1.5 text-[11px]">
                    <span className="px-2 py-0.5 rounded-full bg-kerala-green/20 text-emerald-300 font-semibold">
                      {n.sport === "cricket" ? "🏏 Cricket" : n.sport === "football" ? "⚽ Football" : "🏅 Sports"}
                    </span>
                    {n.lang === "ml" && <span className="px-1.5 py-0.5 rounded bg-kerala-gold/20 text-kerala-gold">മലയാളം</span>}
                    <span className="text-kerala-muted ml-auto">{timeAgo(n.publishedAt)}</span>
                  </div>
                  <h3 className="font-newsreader text-base font-semibold text-kerala-white group-hover:text-kerala-gold transition-colors leading-snug">{n.title}</h3>
                  {n.summary && <p className="text-xs text-kerala-muted mt-1 line-clamp-2">{n.summary}</p>}
                  <div className="text-[11px] text-kerala-muted mt-auto pt-2">{n.source}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
