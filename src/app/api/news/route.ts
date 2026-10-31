import { NextResponse } from "next/server";
import { getDb, schema } from "@/db";
import { MOCK_NEWS } from "@/lib/news";
import { desc } from "drizzle-orm";

const GOOGLE_NEWS_RSS = (q: string) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-IN&gl=IN&ceid=IN:en`;

function parseRss(xml: string) {
  const items: { title: string; link: string; pubDate: string; source: string }[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRegex.exec(xml)) !== null) {
    const block = m[1];
    const title = (block.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "").replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim();
    const link = (block.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? "").trim();
    const pubDate = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? "").trim();
    const source = (block.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] ?? "Google News").replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim();
    // strip trailing " - Source" from title if present
    const cleanedTitle = title.replace(/\s-\s[^-]+$/, "").trim();
    if (cleanedTitle) items.push({ title: cleanedTitle, link, pubDate, source });
  }
  return items;
}

async function fetchGoogleNews() {
  const queries = [
    "Kerala",
    "Kerala news today",
    "Kerala politics",
    "Kerala development",
    "Kerala government",
    "Kerala weather",
    "Kochi",
    "Thiruvananthapuram",
    "Kozhikode",
    "Kerala sports",
    "Kerala culture",
  ];
  const results: any[] = [];
  const seen = new Set<string>();
  await Promise.all(
    queries.map(async (q) => {
      try {
        const res = await fetch(GOOGLE_NEWS_RSS(q), { next: { revalidate: 600 } });
        if (!res.ok) return;
        const xml = await res.text();
        const items = parseRss(xml);
        for (const it of items) {
          if (seen.has(it.title)) continue;
          seen.add(it.title);
          // guess district from title
          const districts = ["Thiruvananthapuram","Kochi","Kozhikode","Thrissur","Kollam","Alappuzha","Kottayam","Palakkad","Kannur","Kasaragod","Idukki","Wayanad","Malappuram","Pathanamthitta","Ernakulam"];
          const district = districts.find((d) => it.title.includes(d)) ?? "Kerala";
          results.push({
            id: `gnews-${results.length}`,
            title: it.title,
            summary: "",
            category: "all",
            district,
            source: it.source,
            publishedAt: it.pubDate ? new Date(it.pubDate) : new Date(),
            url: it.link,
            isBreaking: false,
          });
        }
      } catch (e) {
        console.error("google news fetch error", e);
      }
    })
  );
  return results;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? "all";
  const district = searchParams.get("district");
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);

  const db = getDb();
  let news: any[] = [];

  if (!db) {
    news = [...MOCK_NEWS];
  } else {
    try {
      const rows = await db.select().from(schema.newsTable).orderBy(desc(schema.newsTable.publishedAt));
      news = rows.map((r) => ({
        id: String(r.id),
        title: r.title,
        summary: r.summary,
        category: r.category,
        district: r.district,
        subLocation: r.subLocation ?? undefined,
        source: r.source,
        publishedAt: r.publishedAt,
        imageUrl: r.imageUrl ?? undefined,
        url: r.url ?? "#",
        isBreaking: r.isBreaking ?? false,
      }));
    } catch (e) {
      console.error("news DB error:", e);
      news = [...MOCK_NEWS];
    }
  }

  // Merge live Google News (free, no API key)
  const live = await fetchGoogleNews();
  if (live.length) {
    const existingTitles = new Set(news.map((n) => n.title));
    const novel = live.filter((n) => !existingTitles.has(n.title));
    news = [...novel, ...news];
  }

  if (category !== "all") news = news.filter((n) => n.category === category);
  if (district && district !== "all") news = news.filter((n) => n.district.toLowerCase() === district.toLowerCase());

  return NextResponse.json({ news: news.slice(0, limit), total: news.length, source: db ? "neon_postgres+google_news" : "memory_fallback" });
}