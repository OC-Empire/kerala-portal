import { NextResponse } from "next/server";
import { getLiveNews, getSportsNews } from "@/lib/feeds";
import { archiveNews } from "@/lib/news-archive";

// Called once a day by Vercel Cron (see vercel.json). Idempotent: stories already stored are skipped.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const [newsEn, newsMl, sportsEn, sportsMl] = await Promise.all([getLiveNews("en", 200), getLiveNews("ml", 200), getSportsNews("en", 200), getSportsNews("ml", 200)]);
  await archiveNews(newsEn, "news", { force: true, lang: "en" });
  await archiveNews(newsMl, "news", { force: true, lang: "ml" });
  await archiveNews(sportsEn, "sports", { force: true, lang: "en" });
  await archiveNews(sportsMl, "sports", { force: true, lang: "ml" });
  return NextResponse.json({ ok: true, news: newsEn.length + newsMl.length, sports: sportsEn.length + sportsMl.length });
}
