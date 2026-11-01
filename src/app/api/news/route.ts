import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getLiveNews, type Locale } from "@/lib/feeds";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? "all";
  const district = searchParams.get("district") ?? "all";
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "30", 10) || 30, 1), 60);

  const locale: Locale = (await cookies()).get("NEXT_LOCALE")?.value === "ml" ? "ml" : "en";
  let news = await getLiveNews(locale);
  const available = news.length > 0;

  if (category !== "all") news = news.filter((n) => n.category === category);
  if (district !== "all") news = news.filter((n) => n.district.toLowerCase() === district.toLowerCase());

  return NextResponse.json({
    news: news.slice(0, limit),
    total: news.length,
    source: available ? "publisher_feeds" : "unavailable",
  });
}
