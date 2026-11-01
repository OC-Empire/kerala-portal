import "server-only";
import { getDb, schema } from "@/db";
import { fallbackStore } from "@/lib/db";

export interface CivicRow {
  id: string;
  title: string;
  district: string; // slug
  subLocation: string;
  category: string;
  status: string;
  upvotes: number;
}

export async function getCivicIssues(): Promise<CivicRow[]> {
  const db = getDb();
  const rows = db
    ? await db.select().from(schema.civicIssuesTable).catch((e) => {
        console.error("civic read failed:", e);
        return null;
      })
    : null;
  const src = rows ?? fallbackStore.issues;
  return src.map((r) => ({
    id: r.id,
    title: r.title,
    district: String(r.district).toLowerCase(),
    subLocation: r.subLocation,
    category: r.category,
    status: r.status,
    upvotes: r.upvotes,
  }));
}

export interface CivicSummary {
  openTotal: number;
  openByDistrict: Record<string, number>;
  topByDistrict: Record<string, { id: string; title: string; upvotes: number; status: string }[]>;
}

export async function getCivicSummary(): Promise<CivicSummary> {
  const open = (await getCivicIssues()).filter((i) => i.status !== "resolved");
  const openByDistrict: Record<string, number> = {};
  const topByDistrict: CivicSummary["topByDistrict"] = {};
  for (const i of open) {
    openByDistrict[i.district] = (openByDistrict[i.district] ?? 0) + 1;
    (topByDistrict[i.district] ??= []).push({ id: i.id, title: i.title, upvotes: i.upvotes, status: i.status });
  }
  for (const k of Object.keys(topByDistrict)) topByDistrict[k].sort((a, b) => b.upvotes - a.upvotes).splice(3);
  return { openTotal: open.length, openByDistrict, topByDistrict };
}
