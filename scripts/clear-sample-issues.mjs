// Removes the five demo civic issues that shipped with the original seed (ids iss-1 ... iss-5).
// Real citizen reports have ids like iss-<uuid> and are never touched.
//
//   npm run civic:clear-samples              -> lists what WOULD be deleted (no changes)
//   npm run civic:clear-samples -- --confirm -> deletes them
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL is not set"); process.exit(1); }
const sql = neon(url);
const confirm = process.argv.includes("--confirm");

const rows = await sql.query(`SELECT id, title, district, upvotes, created_at FROM civic_issues WHERE id ~ '^iss-[0-9]{1,3}$' ORDER BY id`);
const all = await sql.query(`SELECT count(*)::int AS n FROM civic_issues`);
console.log(`civic_issues total: ${all[0].n} | demo reports matching iss-<number>: ${rows.length}`);
rows.forEach((r) => console.log(`  ${r.id}  ▲${r.upvotes}  [${r.district}]  ${r.title}`));
if (!rows.length) { console.log("Nothing to delete."); process.exit(0); }
if (!confirm) { console.log("\nDry run: nothing deleted. Re-run with --confirm to delete the rows above."); process.exit(0); }
const del = await sql.query(`DELETE FROM civic_issues WHERE id ~ '^iss-[0-9]{1,3}$' RETURNING id`);
console.log(`\nDeleted ${del.length} demo reports.`);
