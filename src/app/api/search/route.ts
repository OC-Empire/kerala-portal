import { NextResponse } from "next/server";
import { DISTRICTS } from "@/lib/districts";
import { getLiveNews } from "@/lib/feeds";
import { getCivicIssues } from "@/lib/civic-data";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getDb, schema } from "@/db";
import { and, ilike, or, sql } from "drizzle-orm";
import { isMissingTable } from "@/lib/db-errors";

const norm = (s: string) => s.toLowerCase().normalize("NFC");
const LIMIT = 5;

export async function GET(request: Request) {
  const rl = rateLimit(`search:${clientIp(request)}`, 40, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many searches" }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
  }

  const q = norm(new URL(request.url).searchParams.get("q") ?? "").trim().slice(0, 60);
  const empty = { districts: [], places: [], news: [], civic: [], events: [] };
  if (q.length < 2) return NextResponse.json({ results: empty });

  // every typed word must appear somewhere in the item's text, in any order ("thalassery biryani" finds "Thalassery dum biryani")
  const tokens = q.split(/\s+/).filter((t) => t.length >= 2);
  const has = (...vals: (string | undefined)[]) => {
    const text = norm(vals.filter(Boolean).join(" "));
    return tokens.length > 0 && tokens.every((t) => text.includes(t));
  };

  const districts = DISTRICTS.filter((d) =>
    has(d.name, d.malayalamName, d.capital, d.tagline, ...d.famousFor, ...d.signatureFood, ...d.culturalIcons)
  )
    .slice(0, LIMIT)
    .map((d) => ({ slug: d.slug, name: d.name, malayalamName: d.malayalamName, tagline: d.tagline }));

  const places: { name: string; district: string; slug: string; kind: string }[] = [];
  for (const d of DISTRICTS) {
    for (const s of d.subLocations) {
      if (has(s.name, s.malayalamName, s.tagline, ...s.highlights)) places.push({ name: s.name, district: d.name, slug: d.slug, kind: s.type });
    }
    for (const t of d.touristSpots) {
      if (has(t.name, t.description)) places.push({ name: t.name, district: d.name, slug: d.slug, kind: "attraction" });
    }
  }

  // curated places & events from the database (skipped quietly until the tables exist)
  let dbPlaces: { name: string; district: string; slug: string; kind: string }[] = [];
  let events: { id: string; title: string; district: string; sport: string | null; category: string }[] = [];
  const db = getDb();
  if (db) {
    try {
      const anyOf = (cols: any[], t: string) => or(...cols.map((c) => ilike(c, `%${t.replace(/[%_\\]/g, "")}%`)));
      const rows = await db.select().from(schema.placesTable)
        .where(and(...tokens.map((t) => anyOf([schema.placesTable.name, schema.placesTable.malayalamName, schema.placesTable.description], t))))
        .limit(LIMIT);
      dbPlaces = rows.map((r) => ({ name: r.name, district: DISTRICTS.find((d) => d.slug === r.districtSlug)?.name ?? r.districtSlug, slug: r.districtSlug, kind: r.category }));
      const ev = await db.select().from(schema.eventsTable)
        .where(and(...tokens.map((t) => anyOf([schema.eventsTable.title, schema.eventsTable.malayalamTitle, schema.eventsTable.venue], t))))
        .limit(LIMIT);
      events = ev.map((r) => ({ id: r.id, title: r.title, district: DISTRICTS.find((d) => d.slug === r.districtSlug)?.name ?? "Kerala", sport: r.sport, category: r.category }));
    } catch (e) {
      if (!isMissingTable(e)) console.error("search db failed:", e);
    }
  }

  const [en, ml, issues] = await Promise.all([getLiveNews("en"), getLiveNews("ml"), getCivicIssues()]);
  const news = [...en, ...ml]
    .filter((n) => has(n.title, n.summary, n.district))
    .slice(0, LIMIT)
    .map((n) => ({ id: n.id, title: n.title, district: n.district, source: n.source }));

  const civic = issues
    .filter((i) => has(i.title, i.subLocation, i.district))
    .sort((a, b) => b.upvotes - a.upvotes)
    .slice(0, LIMIT)
    .map((i) => ({ id: i.id, title: i.title, district: i.district, upvotes: i.upvotes }));

  return NextResponse.json({ results: { districts, places: [...dbPlaces, ...places].slice(0, LIMIT), news, civic, events } });
}
