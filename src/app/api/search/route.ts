import { NextResponse } from "next/server";
import { DISTRICTS } from "@/lib/districts";
import { getLiveNews } from "@/lib/feeds";
import { getCivicIssues } from "@/lib/civic-data";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const norm = (s: string) => s.toLowerCase().normalize("NFC");
const LIMIT = 5;

export async function GET(request: Request) {
  const rl = rateLimit(`search:${clientIp(request)}`, 40, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many searches" }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
  }

  const q = norm(new URL(request.url).searchParams.get("q") ?? "").trim().slice(0, 60);
  const empty = { districts: [], places: [], news: [], civic: [] };
  if (q.length < 2) return NextResponse.json({ results: empty });

  const has = (...vals: (string | undefined)[]) => vals.some((v) => v && norm(v).includes(q));

  const districts = DISTRICTS.filter((d) =>
    has(d.name, d.malayalamName, d.capital, d.tagline, ...d.famousFor)
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

  return NextResponse.json({ results: { districts, places: places.slice(0, LIMIT), news, civic } });
}
