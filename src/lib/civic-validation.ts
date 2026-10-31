import { DISTRICTS } from "@/lib/districts";

export const CIVIC_CATEGORIES = ["roads", "water", "electricity", "sanitation", "safety", "other"] as const;
const DISTRICT_SLUGS = new Set(DISTRICTS.map((d) => d.slug));

// strip control chars + collapse whitespace; React escapes on render, this keeps data clean
function clean(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").replace(/[ \t]+/g, " ").trim().slice(0, max);
}

export type CivicInput = {
  title: string;
  description: string;
  district: string;
  subLocation: string;
  category: (typeof CIVIC_CATEGORIES)[number];
};

export function validateCivicInput(body: unknown): { ok: true; value: CivicInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid payload" };
  const b = body as Record<string, unknown>;

  const title = clean(b.title, 120);
  const description = clean(b.description, 1000);
  const district = clean(b.district, 40).toLowerCase();
  const subLocation = clean(b.subLocation, 80) || "General Area";
  const category = clean(b.category, 20).toLowerCase() || "roads";

  if (title.length < 5) return { ok: false, error: "Title must be at least 5 characters" };
  if (description.length < 10) return { ok: false, error: "Description must be at least 10 characters" };
  if (!DISTRICT_SLUGS.has(district)) return { ok: false, error: "Unknown district" };
  if (!(CIVIC_CATEGORIES as readonly string[]).includes(category)) return { ok: false, error: "Unknown category" };
  if (/https?:\/\/|www\./i.test(title + " " + subLocation)) return { ok: false, error: "Links are not allowed in the title or location" };

  return { ok: true, value: { title, description, district, subLocation, category: category as CivicInput["category"] } };
}
