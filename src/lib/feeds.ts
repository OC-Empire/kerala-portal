import "server-only";
import { DISTRICTS } from "@/lib/districts";
import type { NewsCategory } from "@/lib/news";

// Live Kerala news from publisher RSS feeds (direct feeds: real links, summaries, images).
// Cached for 10 minutes by Next's fetch cache.

export type Locale = "en" | "ml";

export interface LiveNewsItem {
  id: string;            // base64url(publisher link): stable, lets /news/[id] work even after the feed rotates
  title: string;
  summary: string;
  category: NewsCategory;
  district: string;      // display name, or "Kerala"
  districtSlug: string;  // "" if statewide
  source: string;
  publishedAt: string;   // ISO
  imageUrl?: string;
  url: string;
  // sports feeds only
  sport?: "cricket" | "football" | "other";
  kerala?: boolean;
  lang?: Locale;
}

const FEEDS: Record<Locale, { url: string; source: string }[]> = {
  en: [
    { url: "https://www.thehindu.com/news/national/kerala/feeder/default.rss", source: "The Hindu" },
    { url: "https://english.mathrubhumi.com/rss/news/kerala", source: "Mathrubhumi English" },
  ],
  ml: [{ url: "https://www.asianetnews.com/rss/kerala-news", source: "Asianet News" }],
};

// Only these publishers can be opened through the in-site reader
export const ALLOWED_PUBLISHER_HOSTS = ["thehindu.com", "mathrubhumi.com", "asianetnews.com"];

export function isAllowedPublisherUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    return (
      u.protocol === "https:" &&
      ALLOWED_PUBLISHER_HOSTS.some((h) => u.hostname === h || u.hostname.endsWith("." + h))
    );
  } catch {
    return false;
  }
}

export const encodeId = (url: string) => Buffer.from(url, "utf8").toString("base64url");
export function decodeId(id: string): string | null {
  try {
    const url = Buffer.from(id, "base64url").toString("utf8");
    return isAllowedPublisherUrl(url) ? url : null;
  } catch {
    return null;
  }
}

// ---------- parsing helpers ----------
const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", ndash: "–", mdash: "—" };
export function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}
const unCdata = (s: string) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
export function toText(html: string): string {
  // decode first: some feeds double-encode their markup (&lt;p&gt;)
  return decodeEntities(unCdata(html)).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
const tag = (block: string, name: string) =>
  block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"))?.[1] ?? "";
const attr = (block: string, tagName: string, a: string) =>
  block.match(new RegExp(`<${tagName}\\b[^>]*\\b${a}="([^"]+)"`, "i"))?.[1];

// ---------- classification ----------
const DISTRICT_ALIASES: [string, RegExp][] = [
  ["thiruvananthapuram", /thiruvananthapuram|trivandrum|vizhinjam|kazhakootam|kazhakkoottam|technopark|neyyattinkara|attingal|varkala|തിരുവനന്തപുരം|വിഴിഞ്ഞം|കഴക്കൂട്ടം/i],
  ["kollam", /\bkollam\b|kottarakkara|punalur|കൊല്ലം/i],
  ["pathanamthitta", /pathanamthitta|sabarimala|adoor|thiruvalla|പത്തനംതിട്ട|ശബരിമല/i],
  ["alappuzha", /alappuzha|alleppey|kuttanad|cherthala|kayamkulam|ആലപ്പുഴ|കുട്ടനാട്/i],
  ["kottayam", /kottayam|kumarakom|pala\b|changanassery|കോട്ടയം/i],
  ["idukki", /idukki|munnar|thekkady|kattappana|ഇടുക്കി|മൂന്നാർ/i],
  ["ernakulam", /ernakulam|kochi|cochin|kakkanad|aluva|angamaly|perumbavoor|muvattupuzha|kalamassery|എറണാകുളം|കൊച്ചി|കാക്കനാട്/i],
  ["thrissur", /thrissur|trissur|irinjalakuda|guruvayur|chalakudy|തൃശൂർ|തൃശ്ശൂർ|ഗുരുവായൂർ/i],
  ["palakkad", /palakkad|palghat|ottapalam|attappadi|പാലക്കാട്|അട്ടപ്പാടി/i],
  ["malappuram", /malappuram|manjeri|tirur|nilambur|perinthalmanna|പൊന്നാനി|മലപ്പുറം/i],
  ["kozhikode", /kozhikode|calicut|beypore|vadakara|koyilandy|കോഴിക്കോട്|വടകര|കൊയിലാണ്ടി/i],
  ["wayanad", /wayanad|kalpetta|mananthavady|sulthan bathery|വയനാട്|കൽപ്പറ്റ/i],
  ["kannur", /kannur|cannanore|thalassery|payyannur|taliparamba|കണ്ണൂർ|തലശ്ശേരി|തലശേരി|പയ്യന്നൂർ/i],
  ["kasaragod", /kasaragod|kasargod|kanhangad|കാസർകോട്|കാസർഗോഡ്|കാഞ്ഞങ്ങാട്/i],
];
const NAME_BY_SLUG = Object.fromEntries(DISTRICTS.map((d) => [d.slug, d.name]));

function guessDistrict(text: string): { district: string; districtSlug: string } {
  for (const [slug, re] of DISTRICT_ALIASES) {
    if (re.test(text)) return { district: NAME_BY_SLUG[slug] ?? slug, districtSlug: slug };
  }
  return { district: "Kerala", districtSlug: "" };
}

const CATEGORY_RULES: [NewsCategory, RegExp][] = [
  ["crime", /arrest|murder|police|court|custody|accused|robbery|theft|assault|crime|bail|fir\b|smuggl|ganja|drug|അറസ്റ്റ്|കൊല|പോലീസ്|കേസ്|കോടതി/i],
  ["weather", /rain|monsoon|flood|landslide|cyclone|heatwave|weather|alert|orange alert|yellow alert|മഴ|വെള്ളപ്പൊക്ക|ഉരുൾ|ന്യൂനമർദ|ജാഗ്രത/i],
  ["politics", /\bcm\b|chief minister|minister|ldf|udf|bjp|cpi\(?m\)?|congress|assembly|election|poll|party|mla|\bmp\b|governor|cabinet|സർക്കാർ|മന്ത്രി|തെരഞ്ഞെടുപ്പ്|സിപിഎം|കോൺഗ്രസ്/i],
  ["health", /hospital|health|disease|virus|nipah|dengue|covid|doctor|medical|vaccine|ആശുപത്രി|ആരോഗ്യ|പനി|നിപ/i],
  ["sports", /cricket|football|isl\b|kerala blasters|olympic|athlet|tournament|match|medal|sports|ക്രിക്കറ്റ്|ഫുട്ബോൾ|കായിക/i],
  ["tech", /startup|technopark|infopark|\bai\b|software|digital|cyber|tech\b|it park|ഐടി|സ്റ്റാർട്ടപ്/i],
  ["tourism", /tourism|tourist|houseboat|backwater|resort|beach|heritage|travel|ടൂറിസം|വിനോദസഞ്ചാര/i],
  ["infrastructure", /road|bridge|metro|airport|port\b|vizhinjam|railway|highway|nh[- ]?66|project|water authority|kseb|power cut|ഹൈവേ|പാലം|മെട്രോ|റോഡ്|റെയിൽ/i],
  ["culture", /festival|theyyam|film|cinema|actor|actress|music|temple|pooram|onam|vishu|literature|art\b|ഉത്സവം|സിനിമ|പൂരം|ഓണം/i],
  ["nri", /\bnri\b|gulf|pravasi|norka|expatriate|diaspora|remittance|പ്രവാസി|ഗൾഫ്|നോർക്ക/i],
];
function guessCategory(text: string): NewsCategory {
  for (const [cat, re] of CATEGORY_RULES) if (re.test(text)) return cat;
  return "general";
}

// ---------- fetch + parse ----------
interface ParseOpts { sports?: boolean; sport?: "cricket" | "football"; lang?: Locale }

const CRICKET_RE = /cricket|\bipl\b|ranji|bcci|test match|\bodi\b|\bt20|wicket|batter|batsman|bowler|innings|ക്രിക്കറ്റ്|ഐപിഎൽ|വിക്കറ്റ്/i;
const FOOTBALL_RE = /football|\bisl\b|fifa|\bgoal\b|striker|blasters|premier league|la liga|champions league|santosh trophy|ഫുട്ബോൾ|ഗോൾ|ബ്ലാസ്റ്റേഴ്സ്/i;
const KERALA_SPORT_RE = /kerala|keralam|kochi|cochin|blasters|thiruvananthapuram|trivandrum|kozhikode|calicut|thrissur|malappuram|kannur|kasaragod|wayanad|palakkad|alappuzha|kottayam|kollam|idukki|pathanamthitta|sanju samson|santosh trophy|കേരള|കൊച്ചി|തിരുവനന്തപുരം|കോഴിക്കോട്|തൃശൂർ|തൃശ്ശൂർ|മലപ്പുറം|കണ്ണൂർ|ബ്ലാസ്റ്റേഴ്സ്|സഞ്ജു/i;

function parseFeed(xml: string, source: string, max: number, opts: ParseOpts = {}): LiveNewsItem[] {
  const out: LiveNewsItem[] = [];
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/g) ?? [];
  for (const b of blocks.slice(0, max)) {
    const title = toText(tag(b, "title"));
    const url = toText(tag(b, "link")) || toText(tag(b, "guid"));
    if (!title || !isAllowedPublisherUrl(url)) continue;

    let summary = toText(tag(b, "description")).replace(/\s*Read more\.?$/i, "").trim();
    if (summary === title) summary = "";
    if (summary.length > 320) summary = summary.slice(0, 317).replace(/\s+\S*$/, "") + "…";

    const pub = toText(tag(b, "pubDate"));
    const date = pub ? new Date(pub) : new Date();
    const imageRaw = attr(b, "media:content", "url") ?? attr(b, "media:thumbnail", "url") ?? attr(b, "enclosure", "url");
    const imageUrl = imageRaw ? decodeEntities(imageRaw) : undefined;

    const text = `${title} ${summary}`;
    const sportsFields = opts.sports
      ? {
          sport: (opts.sport ?? (CRICKET_RE.test(text) ? "cricket" : FOOTBALL_RE.test(text) ? "football" : "other")) as "cricket" | "football" | "other",
          kerala: KERALA_SPORT_RE.test(text),
          lang: opts.lang,
        }
      : {};
    out.push({
      id: encodeId(url),
      title,
      summary,
      category: opts.sports ? "sports" : guessCategory(text),
      ...guessDistrict(text),
      ...sportsFields,
      source,
      publishedAt: (isNaN(date.getTime()) ? new Date() : date).toISOString(),
      imageUrl: imageUrl && imageUrl.startsWith("https://") ? imageUrl : undefined,
      url,
    });
  }
  return out;
}

export async function getLiveNews(locale: Locale = "en", limit = 60): Promise<LiveNewsItem[]> {
  const results = await Promise.allSettled(
    FEEDS[locale].map(async (f) => {
      const res = await fetch(f.url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; KeralaPortal/1.0)" },
        next: { revalidate: 600 },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`${f.source} ${res.status}`);
      return parseFeed(await res.text(), f.source, 40);
    })
  );

  const seen = new Set<string>();
  const items: LiveNewsItem[] = [];
  for (const r of results) {
    if (r.status === "rejected") {
      console.error("feed failed:", r.reason);
      continue;
    }
    for (const it of r.value) {
      const key = it.title.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      items.push(it);
    }
  }
  items.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
  return items.slice(0, limit);
}

// ---------- sports ----------
const SPORTS_FEEDS: Record<Locale, { url: string; source: string; sport?: "cricket" | "football" }[]> = {
  en: [
    { url: "https://www.thehindu.com/sport/feeder/default.rss", source: "The Hindu" },
    { url: "https://www.thehindu.com/sport/cricket/feeder/default.rss", source: "The Hindu", sport: "cricket" },
    { url: "https://www.thehindu.com/sport/football/feeder/default.rss", source: "The Hindu", sport: "football" },
    { url: "https://english.mathrubhumi.com/rss/sports", source: "Mathrubhumi English" },
  ],
  ml: [{ url: "https://www.asianetnews.com/rss/sports", source: "Asianet News" }],
};

async function fetchFeedItems(f: { url: string; source: string; sport?: "cricket" | "football" }, lang: Locale, max: number) {
  const res = await fetch(f.url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; KeralaPortal/1.0)" },
    next: { revalidate: 600 },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`${f.source} ${res.status}`);
  return parseFeed(await res.text(), f.source, max, { sports: true, sport: f.sport, lang });
}

/**
 * Sports news. For English readers we also pull Kerala-related items from the Malayalam
 * feed (flagged lang:"ml"), because Kerala-specific English sports coverage is thin.
 */
export async function getSportsNews(locale: Locale = "en", limit = 80): Promise<LiveNewsItem[]> {
  const jobs: Promise<LiveNewsItem[]>[] = SPORTS_FEEDS[locale].map((f) => fetchFeedItems(f, locale, 40));
  if (locale === "en") {
    jobs.push(
      ...SPORTS_FEEDS.ml.map((f) => fetchFeedItems(f, "ml", 60).then((items) => items.filter((i) => i.kerala)))
    );
  }
  const results = await Promise.allSettled(jobs);
  const seen = new Set<string>();
  const items: LiveNewsItem[] = [];
  for (const r of results) {
    if (r.status === "rejected") { console.error("sports feed failed:", r.reason); continue; }
    for (const it of r.value) {
      // The Hindu appears in several feeds: prefer the version with a specific sport
      const key = it.url;
      if (seen.has(key)) {
        const prev = items.find((x) => x.url === key);
        if (prev && prev.sport === "other" && it.sport !== "other") prev.sport = it.sport;
        continue;
      }
      seen.add(key);
      items.push(it);
    }
  }
  items.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
  return items.slice(0, limit);
}
