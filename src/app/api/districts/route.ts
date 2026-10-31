import { NextResponse } from "next/server";
import { getDb, schema } from "@/db";
import { DISTRICTS, KERALA_STATS } from "@/lib/districts";
import { eq } from "drizzle-orm";

export async function GET() {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ districts: DISTRICTS, stats: KERALA_STATS, source: "memory_fallback" });
  }
  try {
    const rows = await db.select().from(schema.districtsTable);
    const districts = rows.map((r) => ({
      id: r.id,
      name: r.name,
      malayalamName: r.malayalamName,
      slug: r.slug,
      capital: r.capital,
      region: r.region,
      color: r.color,
      accentBg: r.accentBg,
      population: r.population,
      area: r.area,
      famousFor: r.famousFor,
      touristSpots: r.touristSpots,
      signatureFood: r.signatureFood,
      culturalIcons: r.culturalIcons,
      coordinates: { lat: Number(r.lat), lng: Number(r.lng) },
      tagline: r.tagline,
    }));
    return NextResponse.json({ districts, stats: KERALA_STATS, source: "neon_postgres" });
  } catch (e) {
    console.error("districts DB error:", e);
    return NextResponse.json({ districts: DISTRICTS, stats: KERALA_STATS, source: "memory_fallback" });
  }
}