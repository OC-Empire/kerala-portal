import { NextResponse } from "next/server";
import { MOCK_NEWS } from "@/lib/news";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? "all";
  const district = searchParams.get("district");
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);

  let news = [...MOCK_NEWS];
  if (category !== "all") news = news.filter((n) => n.category === category);
  if (district)           news = news.filter((n) => n.district.toLowerCase() === district.toLowerCase());

  return NextResponse.json({ news: news.slice(0, limit), total: news.length });
}
