import { NextResponse } from "next/server";
import { getDb, schema } from "@/db";
import { DISTRICTS } from "@/lib/districts";
import { MOCK_NEWS } from "@/lib/news";
import { or, ilike, sql } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ results: [] });

  const db = getDb();
  if (!db) {
    const ql = q.toLowerCase();
    const districts = DISTRICTS.filter((d) => d.name.toLowerCase().includes(ql) || d.tagline.toLowerCase().includes(ql));
    const news = MOCK_NEWS.filter((n) => n.title.toLowerCase().includes(ql) || n.summary.toLowerCase().includes(ql));
    return NextResponse.json({ results: { districts, news }, source: "memory_fallback" });
  }

  try {
    const districts = await db.select().from(schema.districtsTable).where(ilike(schema.districtsTable.name, `%${q}%`));
    const news = await db.select().from(schema.newsTable).where(ilike(schema.newsTable.title, `%${q}%`));
    return NextResponse.json({ results: { districts, news }, source: "neon_postgres" });
  } catch (e) {
    const ql = q.toLowerCase();
    const districts = DISTRICTS.filter((d) => d.name.toLowerCase().includes(ql));
    const news = MOCK_NEWS.filter((n) => n.title.toLowerCase().includes(ql));
    return NextResponse.json({ results: { districts, news }, source: "memory_fallback" });
  }
}