import "server-only";
import { and, asc, eq, gte, isNull, or, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { isMissingTable } from "@/lib/db-errors";

export interface EventItem {
  id: string;
  title: string;
  malayalamTitle: string | null;
  category: string;
  sport: string | null;
  districtSlug: string | null;
  venue: string | null;
  description: string | null;
  startsAt: string | null; // ISO
  endsAt: string | null;
  dateNote: string | null;
  status: string;
  website: string | null;
  imageUrl: string | null;
  sourceUrl: string | null;
  verified: boolean;
}

const toItem = (r: schema.EventRow): EventItem => ({
  ...r,
  startsAt: r.startsAt ? r.startsAt.toISOString() : null,
  endsAt: r.endsAt ? r.endsAt.toISOString() : null,
});

/** Fixed-date events that haven't finished yet, soonest first. Returns [] if the table/DB isn't available. */
export async function getUpcomingEvents(opts: { district?: string; category?: string; sport?: string; limit?: number } = {}): Promise<EventItem[]> {
  const db = getDb();
  if (!db) return [];
  try {
    const now = new Date();
    const rows = await db
      .select()
      .from(schema.eventsTable)
      .where(
        and(
          sql`${schema.eventsTable.startsAt} is not null`,
          // still running or in the future
          or(gte(schema.eventsTable.endsAt, now), gte(schema.eventsTable.startsAt, new Date(now.getTime() - 24 * 3600_000))),
          eq(schema.eventsTable.status, "scheduled"),
          opts.district ? eq(schema.eventsTable.districtSlug, opts.district) : undefined,
          opts.category ? eq(schema.eventsTable.category, opts.category) : undefined,
          opts.sport ? eq(schema.eventsTable.sport, opts.sport) : undefined
        )
      )
      .orderBy(asc(schema.eventsTable.startsAt))
      .limit(opts.limit ?? 50);
    return rows.map(toItem);
  } catch (e) {
    if (!isMissingTable(e)) console.error("events read failed:", e);
    return [];
  }
}

/** Recurring / not-yet-dated events (the "annual calendar"). */
export async function getUndatedEvents(opts: { district?: string; category?: string; sport?: string } = {}): Promise<EventItem[]> {
  const db = getDb();
  if (!db) return [];
  try {
    const rows = await db
      .select()
      .from(schema.eventsTable)
      .where(
        and(
          isNull(schema.eventsTable.startsAt),
          sql`${schema.eventsTable.status} <> 'cancelled'`,
          opts.district ? eq(schema.eventsTable.districtSlug, opts.district) : undefined,
          opts.category ? eq(schema.eventsTable.category, opts.category) : undefined,
          opts.sport ? eq(schema.eventsTable.sport, opts.sport) : undefined
        )
      )
      .orderBy(asc(schema.eventsTable.title));
    return rows.map(toItem);
  } catch (e) {
    if (!isMissingTable(e)) console.error("undated events read failed:", e);
    return [];
  }
}
