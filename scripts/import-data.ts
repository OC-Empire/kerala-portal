// Import curated places / events from CSV into Postgres.
//
//   npm run data:import -- places data/places.csv --dry-run     # validate only, no DB access
//   npm run data:import -- events data/seed/events.csv          # validate, then upsert
//
// All-or-nothing: if any row fails validation nothing is written. Re-importing the same
// file updates existing rows (ids are stable), it never creates duplicates.
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { DISTRICTS } from "../src/lib/districts";
import { PLACE_CATEGORIES, EVENT_CATEGORIES, SPORTS, EVENT_STATUSES } from "../src/lib/places";

const [kind, file, ...flags] = process.argv.slice(2);
const dryRun = flags.includes("--dry-run");
if ((kind !== "places" && kind !== "events") || !file) {
  console.error("Usage: npm run data:import -- <places|events> <file.csv> [--dry-run]");
  process.exit(2);
}

// ---------- CSV (RFC 4180: quotes, escaped quotes, newlines in cells) ----------
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", q = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (q) {
      if (c === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((x) => x.trim() !== "")) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x.trim() !== "")) rows.push(row);
  return rows;
}

// ---------- validators ----------
const SLUGS = new Set(DISTRICTS.map((d) => d.slug));
const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 80);
const blank = (v?: string) => (v ?? "").trim() === "";
const opt = (v?: string) => (blank(v) ? null : v!.trim());

function url(v: string | undefined, field: string, errs: string[]) {
  if (blank(v)) return null;
  try { const u = new URL(v!.trim()); if (u.protocol === "http:" || u.protocol === "https:") return u.toString(); } catch {}
  errs.push(`${field}: "${v}" is not a valid http(s) URL`);
  return null;
}
function bool(v: string | undefined) { return /^(true|yes|y|1)$/i.test((v ?? "").trim()); }
function num(v: string | undefined, field: string, min: number, max: number, errs: string[]) {
  if (blank(v)) return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < min || n > max) { errs.push(`${field}: "${v}" must be a number between ${min} and ${max}`); return null; }
  return n;
}
// "2026-12-05" or "2026-12-05 18:30" or full ISO. No timezone given => India time (IST).
function when(v: string | undefined, field: string, errs: string[]): string | null {
  if (blank(v)) return null;
  const s = v!.trim();
  let iso = s;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) iso = `${s}T00:00:00+05:30`;
  else if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}$/.test(s)) iso = `${s.replace(" ", "T")}:00+05:30`;
  const d = new Date(iso);
  if (isNaN(d.getTime())) { errs.push(`${field}: "${v}" is not a valid date (use YYYY-MM-DD or YYYY-MM-DD HH:MM)`); return null; }
  return d.toISOString();
}
function oneOf<T extends string>(v: string | undefined, allowed: readonly T[], field: string, errs: string[], fallback?: T): T | null {
  const s = (v ?? "").trim().toLowerCase();
  if (!s && fallback) return fallback;
  if ((allowed as readonly string[]).includes(s)) return s as T;
  errs.push(`${field}: "${v ?? ""}" must be one of: ${allowed.join(", ")}`);
  return null;
}

type Rec = Record<string, string>;

function validatePlace(r: Rec) {
  const errs: string[] = [];
  const district = (r.district_slug ?? "").trim().toLowerCase();
  if (!SLUGS.has(district)) errs.push(`district_slug: "${r.district_slug ?? ""}" is not one of the 14 districts (e.g. ${[...SLUGS].slice(0, 3).join(", ")})`);
  const category = oneOf(r.category, PLACE_CATEGORIES.map((c) => c.key), "category", errs);
  if (blank(r.name)) errs.push("name is required");
  const lat = num(r.lat, "lat", 8, 13, errs), lng = num(r.lng, "lng", 74.5, 77.7, errs);
  if ((lat == null) !== (lng == null)) errs.push("lat and lng must be given together");
  const row = {
    id: opt(r.id) ?? `pl-${slugify(`${district}-${r.name ?? ""}`)}`,
    district_slug: district, category, name: opt(r.name), malayalam_name: opt(r.malayalam_name), description: opt(r.description),
    address: opt(r.address), lat, lng, phone: opt(r.phone), website: url(r.website, "website", errs), hours: opt(r.hours), fee: opt(r.fee),
    image_url: url(r.image_url, "image_url", errs), source_url: url(r.source_url, "source_url", errs),
    tags: JSON.stringify(blank(r.tags) ? [] : r.tags.split(";").map((t) => t.trim()).filter(Boolean)), verified: bool(r.verified),
  };
  return { row, errs };
}

function validateEvent(r: Rec) {
  const errs: string[] = [];
  if (blank(r.title)) errs.push("title is required");
  const category = oneOf(r.category, EVENT_CATEGORIES.map((c) => c.key), "category", errs);
  const sport = category === "sports" ? oneOf(r.sport, SPORTS.map((s) => s.key), "sport (required for category=sports)", errs) : opt(r.sport);
  const district = (r.district_slug ?? "").trim().toLowerCase();
  if (district && !SLUGS.has(district)) errs.push(`district_slug: "${r.district_slug}" is not a district (leave blank for statewide)`);
  const starts = when(r.starts_at, "starts_at", errs), ends = when(r.ends_at, "ends_at", errs);
  if (starts && ends && ends < starts) errs.push("ends_at is before starts_at");
  if (ends && !starts) errs.push("ends_at given without starts_at");
  const status = oneOf(r.status, EVENT_STATUSES, "status", errs, starts ? "scheduled" : "tbc");
  const row = {
    id: opt(r.id) ?? `ev-${slugify(`${r.title ?? ""}-${district || "kerala"}-${starts ? starts.slice(0, 10) : "recurring"}`)}`,
    title: opt(r.title), malayalam_title: opt(r.malayalam_title), category, sport, district_slug: district || null, venue: opt(r.venue),
    description: opt(r.description), starts_at: starts, ends_at: ends, date_note: opt(r.date_note), status,
    website: url(r.website, "website", errs), image_url: url(r.image_url, "image_url", errs), source_url: url(r.source_url, "source_url", errs),
    verified: bool(r.verified),
  };
  return { row, errs };
}

// ---------- run ----------
const table = parseCsv(readFileSync(file, "utf8"));
if (table.length < 2) { console.error(`${file}: no data rows (only a header?)`); process.exit(1); }
const header = table[0].map((h) => h.trim().toLowerCase());
const validator = kind === "places" ? validatePlace : validateEvent;

const good: Record<string, unknown>[] = [];
let bad = 0;
const ids = new Set<string>();
table.slice(1).forEach((cells, i) => {
  const rec: Rec = {};
  header.forEach((h, j) => (rec[h] = cells[j] ?? ""));
  const { row, errs } = validator(rec);
  if (ids.has(row.id as string)) errs.push(`duplicate id "${row.id}" in this file (two rows with the same name/date?)`);
  ids.add(row.id as string);
  if (errs.length) { bad++; console.error(`✗ line ${i + 2}: ${errs.join(" | ")}`); }
  else good.push(row);
});

console.log(`${kind}: ${good.length} valid, ${bad} invalid (${table.length - 1} rows)`);
if (bad) { console.error("Nothing was imported. Fix the rows above and run again."); process.exit(1); }
if (dryRun) { console.log("Dry run OK: no database access."); process.exit(0); }

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) { console.error("DATABASE_URL is not set"); process.exit(1); }
const sql = neon(dbUrl);
const cols = Object.keys(good[0]);
const text = `INSERT INTO ${kind} (${cols.join(", ")}) VALUES (${cols.map((_, i) => `$${i + 1}${cols[i] === "tags" ? "::jsonb" : ""}`).join(", ")})
  ON CONFLICT (id) DO UPDATE SET ${cols.filter((c) => c !== "id").map((c) => `${c} = EXCLUDED.${c}`).join(", ")}`;
(async () => {
  for (const r of good) await sql.query(text, cols.map((c) => r[c]));
  console.log(`Imported ${good.length} ${kind}.`);
})().catch((e) => { console.error("Import failed:", e.message ?? e); process.exit(1); });
