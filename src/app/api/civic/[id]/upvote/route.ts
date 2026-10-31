import { NextResponse } from "next/server";
import { getDb, schema } from "@/db";
import { fallbackStore } from "@/lib/db";
import { eq, sql } from "drizzle-orm";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();

  if (!db) {
    const issue = fallbackStore.issues.find((i) => i.id === id);
    if (!issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }
    issue.upvotes += 1;
    return NextResponse.json({ success: true, upvotes: issue.upvotes });
  }

  try {
    const result = await db
      .update(schema.civicIssuesTable)
      .set({
        upvotes: sql`${schema.civicIssuesTable.upvotes} + 1`,
      })
      .where(eq(schema.civicIssuesTable.id, id))
      .returning();

    return NextResponse.json({ success: true, upvotes: result[0]?.upvotes ?? 1 });
  } catch (error) {
    const issue = fallbackStore.issues.find((i) => i.id === id);
    if (issue) issue.upvotes += 1;
    return NextResponse.json({ success: true, upvotes: issue ? issue.upvotes : 1 });
  }
}
