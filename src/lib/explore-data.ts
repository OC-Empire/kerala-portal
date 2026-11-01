import "server-only";
import { unstable_cache } from "next/cache";
import { asc } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { isMissingTable } from "@/lib/db-errors";

export interface ExplorePlace {
  id: string;
  category: string;
  name: string;
  malayalamName: string | null;
  address: string | null;
  description: string | null;
  lat: number | null;
  lng: number | null;
  website: string | null;
}
export interface ExploreEvent {
  id: string;
  title: string;
  malayalamTitle: string | null;
  category: string;
  sport: string | null;
  districtSlug: string | null;
  dateNote: string | null;
  startsAt: string | null;
  venue: string | null;
}
export interface ExploreDistrict {
  counts: Record<string, number>;            // true totals per category
  items: Record<string, ExplorePlace[]>;     // top few per category (for the dashboard cards)
}
export interface ExploreData {
  districts: Record<string, ExploreDistrict>;
  events: ExploreEvent[];                    // upcoming + undated (statewide and district)
}

const PER_CATEGORY = 6;

async function load(): Promise<ExploreData> {
  const out: ExploreData = { districts: {}, events: [] };
  const db = getDb();
  if (!db) return out;
  try {
    // insertion order = curated notability order (importer inserts most notable first)
    const places = await db.select().from(schema.placesTable).orderBy(asc(schema.placesTable.createdAt), asc(schema.placesTable.name));
    for (const p of places) {
      const d = (out.districts[p.districtSlug] ??= { counts: {}, items: {} });
      d.counts[p.category] = (d.counts[p.category] ?? 0) + 1;
      const list = (d.items[p.category] ??= []);
      if (list.length < PER_CATEGORY) {
        list.push({ id: p.id, category: p.category, name: p.name, malayalamName: p.malayalamName, address: p.address, description: p.description ? (p.description.length > 140 ? p.description.slice(0, 137).replace(/\s+\S*$/, "") + "…" : p.description) : null, lat: p.lat, lng: p.lng, website: p.website });
      }
    }
    const events = await db.select().from(schema.eventsTable).orderBy(asc(schema.eventsTable.startsAt), asc(schema.eventsTable.title));
    const cutoff = Date.now() - 24 * 3600_000;
    out.events = events
      .filter((e) => e.status !== "cancelled" && (!e.startsAt || e.startsAt.getTime() >= cutoff || (e.endsAt && e.endsAt.getTime() >= Date.now())))
      .map((e) => ({
        id: e.id, title: e.title, malayalamTitle: e.malayalamTitle, category: e.category, sport: e.sport, districtSlug: e.districtSlug,
        dateNote: e.dateNote, startsAt: e.startsAt ? e.startsAt.toISOString() : null, venue: e.venue,
      }));
  } catch (e) {
    if (!isMissingTable(e)) console.error("explore data failed:", e);
  }
  return out;
}

export const getExploreData = unstable_cache(load, ["explore-data-v1"], { revalidate: 600, tags: ["explore"] });
