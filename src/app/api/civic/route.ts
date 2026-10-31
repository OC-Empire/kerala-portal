import { NextResponse } from "next/server";
import { getDb, schema } from "@/db";
import { fallbackStore } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { validateCivicInput } from "@/lib/civic-validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const district = searchParams.get("district");
  const category = searchParams.get("category");
  const status = searchParams.get("status");

  const db = getDb();

  if (!db) {
    let filtered = [...fallbackStore.issues];
    if (district && district !== "all") {
      filtered = filtered.filter((i) => i.district.toLowerCase() === district.toLowerCase());
    }
    if (category && category !== "all") {
      filtered = filtered.filter((i) => i.category.toLowerCase() === category.toLowerCase());
    }
    if (status && status !== "all") {
      filtered = filtered.filter((i) => i.status.toLowerCase() === status.toLowerCase());
    }
    return NextResponse.json({ issues: filtered, source: "memory_fallback" });
  }

  try {
    const issues = await db.select().from(schema.civicIssuesTable);
    return NextResponse.json({ issues, source: "neon_postgres" });
  } catch (error) {
    console.error("Neon DB query error, falling back to local memory:", error);
    return NextResponse.json({ issues: fallbackStore.issues, source: "memory_fallback" });
  }
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  const rl = rateLimit(`civic-post:${ip}`, 5, 10 * 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many reports. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = validateCivicInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const newIssue = {
    id: `iss-${crypto.randomUUID()}`,
    ...parsed.value,
    status: "open",
    upvotes: 1,
    createdAt: new Date().toISOString(),
  };

  const db = getDb();
  if (!db) {
    // No database configured (local dev): keep in memory
    fallbackStore.issues.unshift(newIssue);
    return NextResponse.json({ success: true, issue: newIssue }, { status: 201 });
  }

  try {
    await db.insert(schema.civicIssuesTable).values({
      id: newIssue.id,
      title: newIssue.title,
      description: newIssue.description,
      district: newIssue.district,
      subLocation: newIssue.subLocation,
      category: newIssue.category,
      status: newIssue.status,
      upvotes: 1,
    });
    return NextResponse.json({ success: true, issue: newIssue }, { status: 201 });
  } catch (err) {
    console.error("civic insert failed:", err);
    return NextResponse.json({ error: "Could not save your report. Please try again." }, { status: 503 });
  }
}
