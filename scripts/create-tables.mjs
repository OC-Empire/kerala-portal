// Usage: node --env-file=.env.local scripts/create-tables.mjs
// Idempotent + additive: only creates the places/events tables (and indexes) if missing.
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL is not set"); process.exit(1); }
const sql = neon(url);

const statements = [
  `CREATE TABLE IF NOT EXISTS places (
    id text PRIMARY KEY,
    district_slug text NOT NULL,
    category text NOT NULL,
    name text NOT NULL,
    malayalam_name text,
    description text,
    address text,
    lat double precision,
    lng double precision,
    phone text,
    website text,
    hours text,
    fee text,
    image_url text,
    source_url text,
    tags jsonb NOT NULL DEFAULT '[]'::jsonb,
    verified boolean NOT NULL DEFAULT false,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS places_district_idx ON places (district_slug, category)`,
  `CREATE TABLE IF NOT EXISTS events (
    id text PRIMARY KEY,
    title text NOT NULL,
    malayalam_title text,
    category text NOT NULL,
    sport text,
    district_slug text,
    venue text,
    description text,
    starts_at timestamptz,
    ends_at timestamptz,
    date_note text,
    status text NOT NULL DEFAULT 'scheduled',
    website text,
    image_url text,
    source_url text,
    verified boolean NOT NULL DEFAULT false,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS events_starts_idx ON events (starts_at)`,
  `CREATE INDEX IF NOT EXISTS events_district_idx ON events (district_slug)`,
];

for (const s of statements) {
  await sql.query(s);
  console.log("ok:", s.split("\n")[0].slice(0, 70));
}
const t = await sql.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY 1`);
console.log("tables now:", t.map((r) => r.table_name).join(", "));
