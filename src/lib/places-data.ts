import "server-only";
import { asc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { isMissingTable } from "@/lib/db-errors";

export type PlaceItem = Omit<schema.PlaceRow, "createdAt">;

/** Curated places for a district (all categories). Returns [] if the table/DB isn't available. */
export async function getPlaces(district: string): Promise<PlaceItem[]> {
  const db = getDb();
  if (!db) return [];
  try {
    const rows = await db
      .select()
      .from(schema.placesTable)
      .where(eq(schema.placesTable.districtSlug, district))
      .orderBy(asc(schema.placesTable.category), asc(schema.placesTable.name));
    return rows.map(({ createdAt: _c, ...rest }) => rest);
  } catch (e) {
    if (!isMissingTable(e)) console.error("places read failed:", e);
    return [];
  }
}
