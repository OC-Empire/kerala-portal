import "server-only";
import { unstable_cache } from "next/cache";
import { groqChat, groqConfigured } from "@/lib/groq";
import type { LiveNewsItem, Locale } from "@/lib/feeds";

export interface BriefBullet {
  text: string;
  storyId: string; // links the bullet to an in-site story
}

// The model only sees real headlines and must cite which one each bullet comes from.
async function generate(locale: Locale, items: { id: string; title: string; district: string }[]): Promise<BriefBullet[]> {
  const list = items.map((n, i) => `${i + 1}. [${n.district}] ${n.title}`).join("\n");
  const lang = locale === "ml" ? "Malayalam (മലയാളം)" : "English";
  const text = await groqChat(
    [
      {
        role: "system",
        content: `You write a short daily news brief for a Kerala portal. Output ONLY JSON: {"bullets":[{"text":string,"n":number}]}.
Rules: pick the 4 most important DIFFERENT stories from the numbered headlines; each bullet is ONE plain sentence under 140 characters in ${lang}; "n" is the headline number it summarises. Use ONLY facts present in that headline. Do not add names, numbers, causes or outcomes that are not in it. No markdown.`,
      },
      { role: "user", content: list },
    ],
    { json: true, maxTokens: 900, temperature: 0.3, timeoutMs: 15_000 }
  );
  const data = JSON.parse(text);
  const out: BriefBullet[] = [];
  for (const b of Array.isArray(data?.bullets) ? data.bullets : []) {
    const idx = Number(b?.n) - 1;
    const t = typeof b?.text === "string" ? b.text.replace(/\*\*|__/g, "").trim().slice(0, 180) : "";
    if (!t || !Number.isInteger(idx) || !items[idx] || out.some((o) => o.storyId === items[idx].id)) continue;
    out.push({ text: t, storyId: items[idx].id });
  }
  return out.slice(0, 4);
}

// Cached per locale + the exact set of headlines, so Groq's free tier sees at most a few calls an hour
const cached = unstable_cache(
  async (locale: Locale, payload: string) => generate(locale, JSON.parse(payload)),
  ["daily-brief-v1"],
  { revalidate: 1800 }
);

export async function getBrief(locale: Locale, news: LiveNewsItem[]): Promise<BriefBullet[]> {
  if (!groqConfigured() || news.length < 4) return [];
  try {
    const top = news.slice(0, 14).map((n) => ({ id: n.id, title: n.title, district: n.district }));
    return await cached(locale, JSON.stringify(top));
  } catch (e) {
    console.error("brief failed:", e);
    return [];
  }
}
