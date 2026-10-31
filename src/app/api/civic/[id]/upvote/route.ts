import { NextResponse } from "next/server";
import { getDb, schema } from "@/db";
import { fallbackStore } from "@/lib/db";
import { eq, sql } from "drizzle-orm";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const COOKIE = "kp_votes";
const MAX_REMEMBERED = 100;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^iss-[A-Za-z0-9-]{1,64}$/.test(id)) {
    return NextResponse.json({ error: "Invalid issue id" }, { status: 400 });
  }

  const rl = rateLimit(`upvote:${clientIp(request)}`, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many votes. Slow down." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  // One vote per issue per browser (cookie). Best-effort dedupe; a durable
  // per-user guarantee needs auth or a votes table.
  const voted = (request.headers.get("cookie") ?? "")
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1)
    .split(",")
    .filter(Boolean) ?? [];
  if (voted.includes(id)) {
    return NextResponse.json({ error: "Already voted" }, { status: 409 });
  }

  const withCookie = (res: NextResponse) => {
    res.cookies.set(COOKIE, [...voted, id].slice(-MAX_REMEMBERED).join(","), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
    return res;
  };

  const db = getDb();
  if (!db) {
    const issue = fallbackStore.issues.find((i) => i.id === id);
    if (!issue) return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    issue.upvotes += 1;
    return withCookie(NextResponse.json({ success: true, upvotes: issue.upvotes }));
  }

  try {
    const result = await db
      .update(schema.civicIssuesTable)
      .set({ upvotes: sql`${schema.civicIssuesTable.upvotes} + 1` })
      .where(eq(schema.civicIssuesTable.id, id))
      .returning();

    if (!result[0]) return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    return withCookie(NextResponse.json({ success: true, upvotes: result[0].upvotes }));
  } catch (error) {
    console.error("upvote failed:", error);
    return NextResponse.json({ error: "Could not record vote" }, { status: 503 });
  }
}
