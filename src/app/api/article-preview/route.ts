import { NextResponse } from "next/server";
import { safeFetchText } from "@/lib/safe-fetch";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  if (!url || url.length > 2048) return NextResponse.json({ synopsis: null, content: null });

  const rl = rateLimit(`preview:${clientIp(request)}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { synopsis: null, content: null, error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  try {
    const { text: html } = await safeFetchText(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; KeralaPortal/1.0)" },
    });

    // Extract og:description / meta description as synopsis
    const og = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i);
    const meta = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
    const synopsis = (og?.[1] || meta?.[1] || "").trim();

    // Extract article body text from <p> tags within article/main/content
    let content = "";
    const articleMatch = html.match(/<article[\s\S]*?<\/article>/i) || html.match(/<main[\s\S]*?<\/main>/i);
    const scope = articleMatch ? articleMatch[0] : html;
    const paragraphs: string[] = [];
    const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    let pm;
    while ((pm = pRegex.exec(scope)) !== null) {
      const text = pm[1].replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
      if (text.length > 40) paragraphs.push(text);
    }
    content = paragraphs.join("\n\n");

    return NextResponse.json({ synopsis: synopsis || null, content: content || null });
  } catch (e) {
    return NextResponse.json({ synopsis: null, content: null });
  }
}