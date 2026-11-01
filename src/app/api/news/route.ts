import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getLiveNews, type Locale } from "@/lib/feeds";
import { archiveNews, queryArchive } from "@/lib/news-archive";

const PAGE = 24;

export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const category = sp.get("category") ?? "all";
  const district = sp.get("district") ?? "all";
  const q = (sp.get("q") ?? "").slice(0, 80);
  const offset = Math.max(parseInt(sp.get("offset") ?? "0", 10) || 0, 0);
  const limit = Math.min(Math.max(parseInt(sp.get("limit") ?? String(PAGE), 10) || PAGE, 1), 60);

  const locale: Locale = (await cookies()).get("NEXT_LOCALE")?.value === "ml" ? "ml" : "en";
  const live = await getLiveNews(locale, 120);
  await archiveNews(live, "news", { lang: locale }); // keep what the feeds show today so it is still here tomorrow

  // Prefer the archive (older stories + pagination); fall back to the live feed if it isn't set up yet
  const archived = await queryArchive({ section: "news", locale, category, district, q, limit, offset });
  if (archived) {
    return NextResponse.json({
      news: archived.items, total: archived.total, hasMore: offset + archived.items.length < archived.total,
      since: archived.since, source: "archive",
    });
  }
  let news = live;
  if (category !== "all") news = news.filter((n) => n.category === category);
  if (district !== "all") news = news.filter((n) => n.district.toLowerCase() === district.toLowerCase());
  const terms = q.toLowerCase().split(/\s+/).filter((t) => t.length >= 2);
  if (terms.length) news = news.filter((n) => terms.every((t) => (n.title + " " + n.summary).toLowerCase().includes(t)));
  return NextResponse.json({
    news: news.slice(offset, offset + limit), total: news.length, hasMore: offset + limit < news.length,
    since: null, source: live.length ? "publisher_feeds" : "unavailable",
  });
}
