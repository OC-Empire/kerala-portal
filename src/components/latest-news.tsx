import Link from "next/link";
import { getTranslations } from "next-intl/server";
import NewsImage from "@/components/news-image";
import { CATEGORY_META } from "@/lib/news";
import { timeAgo } from "@/lib/utils";
import type { LiveNewsItem } from "@/lib/feeds";

function Chip({ item }: { item: LiveNewsItem }) {
  const m = CATEGORY_META[item.category] ?? CATEGORY_META.general;
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${m.bg} ${m.color}`}>{m.label}</span>;
}

export default async function LatestNews({ items }: { items: LiveNewsItem[] }) {
  const t = await getTranslations("news");
  const home = await getTranslations("home");

  if (items.length === 0) {
    return (
      <div className="glass-card p-8 text-center h-full flex flex-col items-center justify-center gap-2">
        <div className="text-3xl">📰</div>
        <p className="text-sm text-kerala-muted">{t("unavailable")}</p>
      </div>
    );
  }

  const featured = items.find((i) => i.imageUrl) ?? items[0];
  const rest = items.filter((i) => i.id !== featured.id).slice(0, 4);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-heading text-2xl flex items-center gap-2">
          <span className="live-dot" /> {home("newsHeading")}
        </h2>
        <Link href="/news" className="text-xs text-kerala-gold hover:underline font-semibold">{home("viewAllNews")}</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Featured */}
      <Link
        href={`/news/${featured.id}`}
        className="group relative block overflow-hidden rounded-2xl border border-kerala-border min-h-[300px] lg:col-span-7 bg-gradient-to-br from-kerala-surface to-kerala-card"
      >
        {featured.imageUrl && (
          <NewsImage
            src={featured.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-kerala-dark via-kerala-dark/60 to-transparent" />
        <div className="relative h-full min-h-[300px] p-5 md:p-6 flex flex-col justify-end gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-kerala-gold text-kerala-dark">{t("topStory")}</span>
            <Chip item={featured} />
            <span className="text-xs text-kerala-gold">📍 {featured.district}</span>
          </div>
          <h3 className="font-newsreader text-xl md:text-2xl font-bold text-kerala-white leading-snug group-hover:text-kerala-gold transition-colors">
            {featured.title}
          </h3>
          {featured.summary && <p className="text-xs md:text-sm text-kerala-white/70 line-clamp-2">{featured.summary}</p>}
          <div className="text-[11px] text-kerala-muted">{featured.source} · {timeAgo(featured.publishedAt)}</div>
        </div>
      </Link>

      {/* List */}
      <div className="lg:col-span-5 flex flex-col gap-2.5">
        {rest.map((n) => (
          <Link
            key={n.id}
            href={`/news/${n.id}`}
            className="group glass-card-hover p-3 flex-1 flex gap-3 items-center border-kerala-border hover:border-kerala-green/60"
          >
            {n.imageUrl ? (
              <NewsImage src={n.imageUrl} alt="" className="h-16 w-24 shrink-0 rounded-lg object-cover" />
            ) : (
              <div className="h-16 w-24 shrink-0 rounded-lg bg-kerala-surface flex items-center justify-center text-xl">📰</div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Chip item={n} />
                <span className="text-[11px] text-kerala-gold truncate">📍 {n.district}</span>
                <span className="text-[11px] text-kerala-muted ml-auto whitespace-nowrap">{timeAgo(n.publishedAt)}</span>
              </div>
              <h3 className="font-newsreader text-sm md:text-[15px] font-semibold text-kerala-white leading-snug line-clamp-2 group-hover:text-kerala-gold transition-colors">
                {n.title}
              </h3>
              <div className="text-[11px] text-kerala-muted mt-0.5">{n.source}</div>
            </div>
          </Link>
        ))}
      </div>
      </div>
    </section>
  );
}
