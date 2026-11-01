import "server-only";
import { and, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { isMissingTable } from "@/lib/db-errors";
import type { LiveNewsItem, Locale } from "@/lib/feeds";

// Publisher feeds only expose their latest few dozen stories. We keep every story we've seen so older
// news stays browsable. The archive grows from the day it is switched on; it cannot reach back further.

let lastIngest = 0;
const seen = new Set<string>(); // ids already written by this server instance

/** Store stories we haven't stored yet. Safe to call often: it skips work done in the last few minutes. */
export async function archiveNews(items: LiveNewsItem[], section: "news" | "sports", opts: { force?: boolean; lang?: Locale } = {}): Promise<void> {
  const { force = false, lang } = opts;
  const db = getDb();
  if (!db || items.length === 0) return;
  const fresh = items.filter((i) => !seen.has(i.id));
  if (fresh.length === 0) return;
  if (!force && Date.now() - lastIngest < 120_000 && fresh.length < 3) return;
  try {
    for (let i = 0; i < fresh.length; i += 100) {
      await db
        .insert(schema.newsItemsTable)
        .values(
          fresh.slice(i, i + 100).map((n) => ({
            id: n.id,
            title: n.title,
            summary: n.summary,
            category: n.category,
            district: n.district,
            districtSlug: n.districtSlug,
            source: n.source,
            url: n.url,
            imageUrl: n.imageUrl ?? null,
            section,
            sport: n.sport ?? null,
            kerala: !!n.kerala,
            lang: n.lang ?? lang ?? "en",
            publishedAt: new Date(n.publishedAt),
          }))
        )
        .onConflictDoNothing();
    }
    fresh.forEach((i) => seen.add(i.id));
    lastIngest = Date.now();
  } catch (e) {
    if (!isMissingTable(e)) console.error("news archive write failed:", e);
  }
}

export interface ArchiveQuery {
  section: "news" | "sports";
  locale: Locale;
  category?: string;
  district?: string;   // display name, e.g. "Kozhikode"
  sport?: string;      // cricket | football | other
  keralaOnly?: boolean;
  q?: string;
  limit?: number;
  offset?: number;
}
export interface ArchivePage { items: LiveNewsItem[]; total: number; since: string | null }

/** Returns null when the archive isn't available (no DB, or table not created yet). */
export async function queryArchive(opts: ArchiveQuery): Promise<ArchivePage | null> {
  const db = getDb();
  if (!db) return null;
  const T = schema.newsItemsTable;
  const where: (SQL | undefined)[] = [eq(T.section, opts.section)];
  if (opts.section === "news") where.push(eq(T.lang, opts.locale));
  else where.push(opts.locale === "en" ? or(eq(T.lang, "en"), and(eq(T.lang, "ml"), eq(T.kerala, true))) : eq(T.lang, "ml"));
  if (opts.category && opts.category !== "all") where.push(eq(T.category, opts.category));
  if (opts.district && opts.district !== "all") where.push(sql`lower(${T.district}) = ${opts.district.toLowerCase()}`);
  if (opts.sport) where.push(eq(T.sport, opts.sport));
  if (opts.keralaOnly) where.push(eq(T.kerala, true));
  for (const t of (opts.q ?? "").toLowerCase().split(/\s+/).filter((x) => x.length >= 2).slice(0, 5)) {
    const like = `%${t.replace(/[%_\\]/g, "")}%`;
    where.push(or(ilike(T.title, like), ilike(T.summary, like)));
  }
  const cond = and(...where);
  try {
    const rows = await db.select().from(T).where(cond).orderBy(desc(T.publishedAt)).limit(Math.min(opts.limit ?? 24, 60)).offset(opts.offset ?? 0);
    const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(T).where(cond);
    const [{ first }] = await db.select({ first: sql<string | null>`min(${T.publishedAt})` }).from(T).where(eq(T.section, opts.section));
    return {
      total: n,
      since: first ? new Date(first).toISOString() : null,
      items: rows.map((r) => ({
        id: r.id, title: r.title, summary: r.summary, category: r.category as LiveNewsItem["category"], district: r.district,
        districtSlug: r.districtSlug, source: r.source, publishedAt: r.publishedAt.toISOString(), imageUrl: r.imageUrl ?? undefined, url: r.url,
        sport: (r.sport ?? undefined) as LiveNewsItem["sport"], kerala: r.kerala, lang: r.lang as Locale,
      })),
    };
  } catch (e) {
    if (!isMissingTable(e)) console.error("news archive read failed:", e);
    return null;
  }
}
