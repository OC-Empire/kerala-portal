import type { Metadata } from "next";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { decodeId, getLiveNews, type Locale, type LiveNewsItem } from "@/lib/feeds";
import { getArticleMeta } from "@/lib/article";
import { CATEGORY_META, type NewsCategory } from "@/lib/news";
import { timeAgo } from "@/lib/utils";
import NewsImage from "@/components/news-image";

type Props = { params: Promise<{ id: string }> };

// Cache the publisher page fetch for 30 min, and dedupe loadStory between generateMetadata and the page
const cachedMeta = unstable_cache(async (url: string) => getArticleMeta(url), ["article-meta-v2"], { revalidate: 1800 });

const loadStory = cache(async function loadStory(id: string) {
  const url = decodeId(id);
  if (!url) return null;
  const locale: Locale = (await cookies()).get("NEXT_LOCALE")?.value === "ml" ? "ml" : "en";
  // Try both feed sets so a shared link opens regardless of the viewer's language
  const feeds = await Promise.all([getLiveNews(locale), getLiveNews(locale === "en" ? "ml" : "en")]);
  const all = feeds.flat();
  const item = all.find((n) => n.id === id) ?? null;
  const page = await cachedMeta(url);
  return { url, item, page, all };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const s = await loadStory(id);
  const title = s?.item?.title ?? s?.page.title;
  if (!title) return { title: "News — Kerala Portal" };
  return {
    title: `${title} — Kerala Portal`,
    description: s?.item?.summary || s?.page.description,
    openGraph: { title, description: s?.item?.summary || s?.page.description, images: s?.item?.imageUrl ?? s?.page.image },
  };
}

export default async function StoryPage({ params }: Props) {
  const { id } = await params;
  const t = await getTranslations("news");
  const s = await loadStory(id);

  const title = s?.item?.title ?? s?.page.title;
  if (!s || !title) {
    return (
      <div className="max-w-2xl mx-auto glass-card p-10 text-center space-y-4">
        <h1 className="font-newsreader text-2xl font-bold text-kerala-white">{t("notFoundTitle")}</h1>
        <p className="text-sm text-kerala-muted">{t("notFoundBody")}</p>
        <Link href="/news" className="btn-primary inline-block text-sm px-5 py-2">{t("back")}</Link>
      </div>
    );
  }

  const { item, page, url } = s;
  const source = item?.source ?? new URL(url).hostname.replace(/^www\./, "");
  const image = item?.imageUrl ?? page.image;
  const summary = item?.summary || page.description || "";
  const cat = (item?.category ?? "general") as NewsCategory;
  const meta = CATEGORY_META[cat] ?? CATEGORY_META.general;
  // avoid repeating the summary as the first excerpt paragraph
  const excerpt = page.excerpt.filter((p) => !summary || !p.startsWith(summary.slice(0, 40)));

  const related: LiveNewsItem[] = s.all
    .filter((n) => n.id !== id)
    .sort((a, b) => Number(b.districtSlug === item?.districtSlug && !!item?.districtSlug) - Number(a.districtSlug === item?.districtSlug && !!item?.districtSlug))
    .slice(0, 3);

  return (
    <article className="max-w-3xl mx-auto space-y-6">
      <Link href="/news" className="text-sm text-kerala-muted hover:text-kerala-white transition-colors">{t("back")}</Link>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={`font-semibold px-2.5 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>{meta.label}</span>
          {item && item.districtSlug ? (
            <Link href={`/district/${item.districtSlug}`} className="text-kerala-gold hover:underline">📍 {item.district}</Link>
          ) : (
            <span className="text-kerala-muted">📍 Kerala</span>
          )}
          {item && <span className="text-kerala-muted">· {timeAgo(item.publishedAt)}</span>}
        </div>
        <h1 className="font-newsreader text-3xl md:text-4xl font-bold text-kerala-white leading-tight">{title}</h1>
        <p className="text-sm text-kerala-muted">{t("via", { source })}</p>
      </header>

      {image && (
        <div className="rounded-2xl overflow-hidden border border-kerala-border">
          <NewsImage src={image} alt={title} className="w-full max-h-[420px] object-cover" />
        </div>
      )}

      <div className="space-y-4 text-kerala-white/90 leading-relaxed text-base md:text-lg">
        {summary && <p className="font-medium">{summary}</p>}
        {excerpt.map((p, i) => <p key={i} className="text-kerala-muted">{p}</p>)}
        {!summary && excerpt.length === 0 && <p className="text-kerala-muted">{t("noPreview")}</p>}
      </div>

      {/* Full-article link */}
      <div className="glass-card p-5 md:p-6 border-kerala-gold/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-xs text-kerala-muted max-w-md">{t("attribution", { source })}</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="btn-gold text-sm font-semibold px-6 py-3 text-center shadow-gold whitespace-nowrap">
          {t("readFull", { source })} ↗
        </a>
      </div>

      {related.length > 0 && (
        <section className="space-y-3 pt-4">
          <h2 className="section-heading text-xl">{t("more")}</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {related.map((n) => (
              <Link key={n.id} href={`/news/${n.id}`} className="glass-card-hover p-4 block">
                <div className="text-[11px] text-kerala-gold mb-1">{n.district} · {timeAgo(n.publishedAt)}</div>
                <div className="font-newsreader text-sm font-semibold text-kerala-white line-clamp-3">{n.title}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
