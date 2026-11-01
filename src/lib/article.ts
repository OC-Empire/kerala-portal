import "server-only";
import { safeFetchText } from "@/lib/safe-fetch";
import { decodeEntities, toText } from "@/lib/feeds";

export interface ArticleMeta {
  title?: string;
  description?: string;
  image?: string;
  excerpt: string[]; // first few paragraphs only: a teaser, not the full article
}

const meta = (html: string, key: string) => {
  const re1 = new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']`, "i");
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`, "i");
  const v = html.match(re1)?.[1] ?? html.match(re2)?.[1];
  return v ? decodeEntities(v).trim() : undefined;
};

/** Fetch a publisher page (SSRF-safe) and pull out the headline, image and a short teaser. */
export async function getArticleMeta(url: string, maxChars = 650): Promise<ArticleMeta> {
  try {
    const { text: html } = await safeFetchText(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; KeralaPortal/1.0)" },
      timeoutMs: 7000,
      maxBytes: 1_500_000,
    });

    const scope = html.match(/<article[\s\S]*?<\/article>/i)?.[0] ?? html;
    const excerpt: string[] = [];
    let total = 0;
    for (const m of scope.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)) {
      // strip share-bar / read-time chrome some publishers put inside the first <p>
      const t = toText(m[1])
        .replace(/^(?:\d+\s*min(?:ute)?s?(?:\s*read)?\s*)?(?:share\s*)?(?:follow us on\s*)?(?:updated[^.]{0,40}\s)?/i, "")
        .trim();
      if (t.length < 60 || /^(also read|read more|subscribe|follow us|copyright|share\b|related topics|read articles|get latest|download)/i.test(t)) continue;
      if (total + t.length > maxChars && excerpt.length) break;
      excerpt.push(t.length > maxChars ? t.slice(0, maxChars).replace(/\s+\S*$/, "") + "…" : t);
      total += t.length;
      if (excerpt.length >= 3) break;
    }

    const image = meta(html, "og:image");
    return {
      title: meta(html, "og:title"),
      description: meta(html, "og:description") ?? meta(html, "description"),
      image: image?.startsWith("https://") ? image : undefined,
      excerpt,
    };
  } catch {
    return { excerpt: [] };
  }
}
