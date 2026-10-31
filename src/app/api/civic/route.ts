import { NextResponse } from "next/server";
import { getDb, schema } from "@/db";
import { fallbackStore } from "@/lib/db";
import { eq, sql } from "drizzle-orm";

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
  try {
    const body = await request.json();
    const { title, description, district, subLocation, category } = body;

    if (!title || !description || !district) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newIssue = {
      id: `iss-${Date.now()}`,
      title,
      description,
      district,
      subLocation: subLocation || "General Area",
      category: category || "roads",
      status: "open",
      upvotes: 1,
      createdAt: new Date().toISOString(),
    };

    const db = getDb();
    if (db) {
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
      } catch (err) {
        console.warn("Neon insert error, appending to memory fallback:", err);
        fallbackStore.issues.unshift(newIssue);
      }
    } else {
      fallbackStore.issues.unshift(newIssue);
    }

    return NextResponse.json({ success: true, issue: newIssue }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 500 });
  }
}
