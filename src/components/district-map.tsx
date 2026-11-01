"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { DISTRICTS } from "@/lib/districts";
import { KERALA_GEO, KERALA_VIEWBOX } from "@/lib/kerala-geo";
import { PLACE_CATEGORIES, eventMeta, sportMeta } from "@/lib/places";
import type { ExploreData } from "@/lib/explore-data";

// Short on-map labels for the long names
const SHORT: Record<string, string> = { thiruvananthapuram: "Trivandrum", pathanamthitta: "Pathanamthitta" };

export type MapHeadline = { id: string; title: string };

export type MapIssue = { id: string; title: string; upvotes: number; status: string };

interface Props {
  /** live stories per district slug */
  counts: Record<string, number>;
  /** newest headlines per district slug (newest first) */
  headlines: Record<string, MapHeadline[]>;
  /** open civic issues per district slug */
  civicCounts: Record<string, number>;
  /** most-upvoted open issues per district slug */
  civicTop: Record<string, MapIssue[]>;
  /** curated places & events for the "Explore more" block */
  explore: ExploreData;
}

type Mode = "stories" | "civic";
const THEME: Record<Mode, { rgb: string; badge: string; badgeText: string }> = {
  stories: { rgb: "46,139,87", badge: "#E8A020", badgeText: "#0A1628" },
  civic: { rgb: "217,79,43", badge: "#F9F5EE", badgeText: "#7a2410" },
};

export default function DistrictMap({ counts: storyCounts, headlines, civicCounts, civicTop, explore }: Props) {
  const t = useTranslations("map");
  const tn = useTranslations("news");
  const te = useTranslations("explore");
  const locale = useLocale();

  // Default selection: the district with the most live stories (gives the panel content immediately)
  const [mode, setMode] = useState<Mode>("stories");
  const counts = mode === "stories" ? storyCounts : civicCounts;
  const theme = THEME[mode];
  const initial = useMemo(
    () => Object.entries(storyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "ernakulam",
    [storyCounts]
  );
  const [selected, setSelected] = useState<string>(initial);
  const [hover, setHover] = useState<string | null>(null);

  const focus = hover ?? selected;
  const d = DISTRICTS.find((x) => x.slug === focus)!;
  const count = counts[focus] ?? 0;
  const list = (headlines[focus] ?? []).slice(0, 4);
  const issues = civicTop[focus] ?? [];

  // "Explore more": categories available for the focused district (+ events)
  const ex = explore.districts[focus];
  // this district's own events first, then statewide ones
  const districtEvents = explore.events
    .filter((e) => !e.districtSlug || e.districtSlug === focus)
    .sort((a, b) => Number(b.districtSlug === focus) - Number(a.districtSlug === focus));
  const exCats = [
    ...PLACE_CATEGORIES.filter((c) => (ex?.counts[c.key] ?? 0) > 0).map((c) => ({ key: c.key, label: c.label, icon: c.icon, n: ex!.counts[c.key] })),
    ...(districtEvents.length ? [{ key: "events", label: te("events"), icon: "🎆", n: districtEvents.length }] : []),
  ];
  const [exCat, setExCat] = useState<string>("");
  const activeCat = exCats.find((c) => c.key === exCat)?.key ?? exCats[0]?.key;
  const max = Math.max(1, ...Object.values(counts));

  // keep the shapes in a fixed DOM order (re-ordering under the cursor can swallow clicks);
  // the focused outline is drawn as a separate overlay instead
  const order = DISTRICTS;

  return (
    <div className="glass-card p-4 md:p-6 flex flex-col">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
        <div>
          <h2 className="section-heading text-2xl">{t("title")}</h2>
          <p className="text-xs text-kerala-muted mt-1">{mode === "stories" ? t("hint") : t("hintCivic")}</p>
        </div>
        <div className="flex items-center gap-4">
          <div role="tablist" aria-label={t("layer")} className="inline-flex rounded-full border border-kerala-border bg-kerala-dark/60 p-1 text-xs">
            {(["stories", "civic"] as Mode[]).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={`px-3.5 py-1.5 rounded-full font-semibold transition-all ${
                  mode === m
                    ? m === "stories" ? "bg-kerala-green text-white shadow" : "bg-kerala-red text-white shadow"
                    : "text-kerala-muted hover:text-kerala-white"
                }`}
              >
                {m === "stories" ? t("layerStories") : t("layerCivic")}
              </button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-2 text-[10px] text-kerala-muted shrink-0">
            <span>{t("fewer")}</span>
            <span className="h-2 w-16 rounded-full" style={{ background: `linear-gradient(90deg, rgba(${theme.rgb},.18), rgba(${theme.rgb},.95))` }} />
            <span>{t("more")}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(280px,380px)_minmax(0,1fr)] gap-5 md:gap-8 flex-1 items-start">
        {/* Map */}
        <div className="relative rounded-2xl overflow-hidden border border-kerala-border/70 bg-[radial-gradient(ellipse_at_0%_50%,#0b2a4a_0%,#0A1628_70%)]">
          <svg
            viewBox={`-20 -10 ${KERALA_VIEWBOX.width + 40} ${KERALA_VIEWBOX.height + 20}`}
            className="w-full h-auto max-h-[560px] md:max-h-none mx-auto block"
            role="group"
            aria-label={t("title")}
          >
            <text x={26} y={KERALA_VIEWBOX.height * 0.62} fontSize="15" fill="#4f7396" opacity=".6" letterSpacing="4" transform={`rotate(-90 26 ${KERALA_VIEWBOX.height * 0.62})`}>
              ARABIAN SEA
            </text>

            {order.map((dist) => {
              const g = KERALA_GEO[dist.slug];
              if (!g) return null;
              const n = counts[dist.slug] ?? 0;
              const intensity = n / max;
              const isSel = dist.slug === selected;
              return (
                <path
                  key={dist.slug}
                  d={g.d}
                  tabIndex={0}
                  role="button"
                  aria-label={`${dist.name}, ${mode === "stories" ? tn("stories", { count: n }) : t("openIssues", { count: n })}`}
                  aria-pressed={isSel}
                  onClick={() => setSelected(dist.slug)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setSelected(dist.slug))}
                  onMouseEnter={() => setHover(dist.slug)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(dist.slug)}
                  onBlur={() => setHover(null)}
                  fill={`rgba(${theme.rgb},${(0.18 + 0.7 * intensity).toFixed(2)})`}
                  stroke="#0A1628"
                  strokeWidth={1.2}
                  strokeLinejoin="round"
                  className="cursor-pointer outline-none transition-[fill,stroke-width] duration-200"
                />
              );
            })}

            {/* highlight for the focused district (overlay, never intercepts the pointer) */}
            {KERALA_GEO[focus] && (
              <path
                d={KERALA_GEO[focus].d}
                fill="none"
                stroke="#E8A020"
                strokeWidth={2.5}
                strokeLinejoin="round"
                pointerEvents="none"
                style={{ filter: "drop-shadow(0 0 7px rgba(232,160,32,.55))" }}
              />
            )}

            {/* labels + story badges (non-interactive) */}
            {DISTRICTS.map((dist) => {
              const g = KERALA_GEO[dist.slug];
              if (!g) return null;
              const n = counts[dist.slug] ?? 0;
              return (
                <g key={dist.slug} pointerEvents="none">
                  <text
                    x={g.cx}
                    y={g.cy + (n ? 15 : 4)}
                    textAnchor="middle"
                    fontSize={(SHORT[dist.slug] ?? dist.name).length > 11 ? 9 : 11}
                    fontWeight={dist.slug === focus ? 700 : 500}
                    fill="#F9F5EE"
                    stroke="#0A1628"
                    strokeWidth="2.6"
                    paintOrder="stroke"
                    opacity={dist.slug === focus ? 1 : 0.85}
                  >
                    {SHORT[dist.slug] ?? dist.name}
                  </text>
                  {n > 0 && (
                    <g>
                      <circle cx={g.cx} cy={g.cy - 3} r="9" fill={theme.badge} stroke="#0A1628" strokeWidth="1.5" />
                      <text x={g.cx} y={g.cy + 0.5} textAnchor="middle" fontSize="10" fontWeight="800" fill={theme.badgeText}>{n}</text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Detail panel */}
        <div className="flex flex-col gap-4 min-w-0" aria-live="polite">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-kerala-gold font-semibold">{d.region} · {d.capital}</div>
            <div className="font-newsreader text-3xl md:text-4xl font-bold text-kerala-white leading-tight break-words">{d.name}</div>
            <div className="text-base text-kerala-muted">{d.malayalamName}</div>
            <p className="text-sm text-kerala-muted leading-relaxed mt-2 max-w-xl">{d.tagline}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center max-w-xl">
            <div className="rounded-xl bg-kerala-dark/50 border border-kerala-border/60 py-3">
              <div className="text-base font-bold gold-text-gradient">{d.population}</div>
              <div className="text-[10px] text-kerala-muted">{t("population")}</div>
            </div>
            <div className="rounded-xl bg-kerala-dark/50 border border-kerala-border/60 py-3">
              <div className="text-base font-bold gold-text-gradient">{d.area}</div>
              <div className="text-[10px] text-kerala-muted">{t("area")}</div>
            </div>
            <div className="rounded-xl bg-kerala-dark/50 border border-kerala-border/60 py-3">
              <div className="text-base font-bold gold-text-gradient">{count}</div>
              <div className="text-[10px] text-kerala-muted">{mode === "stories" ? t("liveNow") : t("openNow")}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {d.famousFor.slice(0, 5).map((f) => (
              <span key={f} className="text-[11px] px-2.5 py-1 rounded-full bg-kerala-green/20 border border-kerala-green/30 text-emerald-300">{f}</span>
            ))}
          </div>

          <div className="rounded-2xl bg-kerala-dark/50 border border-kerala-border/60 p-4">
            <div className="text-[10px] uppercase tracking-wider text-kerala-muted mb-2">{mode === "stories" ? t("latestHere") : t("topIssues")}</div>
            {mode === "stories" ? (
              list.length ? (
                <ul className="space-y-2.5">
                  {list.map((h) => (
                    <li key={h.id}>
                      <Link href={`/news/${h.id}`} className="flex gap-2 font-newsreader text-[15px] font-semibold text-kerala-white hover:text-kerala-gold transition-colors leading-snug">
                        <span className="text-kerala-gold">›</span><span className="line-clamp-2">{h.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-kerala-muted">{t("noStories")}</p>
              )
            ) : issues.length ? (
              <ul className="space-y-2.5">
                {issues.map((i) => (
                  <li key={i.id}>
                    <Link href="/civic" className="flex items-start gap-2 text-sm font-semibold text-kerala-white hover:text-kerala-gold transition-colors leading-snug">
                      <span className="shrink-0 text-[11px] font-bold text-rose-300 bg-rose-900/40 rounded px-1.5 py-0.5">▲ {i.upvotes}</span>
                      <span className="line-clamp-2">{i.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-kerala-muted">{t("noIssues")}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href={`/district/${d.slug}`} className="btn-gold text-sm font-semibold px-5 py-3 text-center shadow-gold">
              {t("explore", { name: d.name })}
            </Link>
            {mode === "civic" && (
              <Link href="/civic" className="btn-primary text-sm font-semibold px-5 py-3 text-center">{t("report")}</Link>
            )}
          </div>
        </div>
      </div>

      {/* Explore more: curated places & events for the focused district */}
      {exCats.length > 0 && (
        <div className="mt-6 pt-5 border-t border-kerala-border/60 space-y-4" aria-live="polite">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="section-heading text-xl">{te("title", { name: d.name })}</h3>
              <p className="text-xs text-kerala-muted mt-0.5">{te("hint")}</p>
            </div>
            {activeCat && activeCat !== "events" && (
              <Link href={`/district/${d.slug}?cat=${activeCat}#places`} className="text-xs text-kerala-gold hover:underline font-semibold">
                {te("seeAll", { count: ex!.counts[activeCat], name: d.name })} →
              </Link>
            )}
            {activeCat === "events" && (
              <Link href={`/district/${d.slug}#events`} className="text-xs text-kerala-gold hover:underline font-semibold">{te("allEvents")} →</Link>
            )}
          </div>

          <div role="tablist" aria-label={te("title", { name: d.name })} className="flex flex-wrap gap-2">
            {exCats.map((c) => (
              <button
                key={c.key}
                role="tab"
                aria-selected={activeCat === c.key}
                onClick={() => setExCat(c.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${activeCat === c.key ? "bg-kerala-green text-white" : "bg-kerala-card text-kerala-muted hover:text-kerala-white"}`}
              >
                {c.icon} {c.label} · {c.n}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeCat === "events"
              ? districtEvents.slice(0, 6).map((e) => {
                  const m = e.category === "sports" ? sportMeta(e.sport) : eventMeta(e.category);
                  return (
                    <Link key={e.id} href={e.category === "sports" ? "/sports" : `/district/${d.slug}#events`} className="glass-card-hover p-4 block">
                      <div className="text-[11px] text-kerala-gold font-semibold">{m.icon} {m.label}</div>
                      <div className="font-newsreader text-base font-bold text-kerala-white mt-1 leading-snug">{locale === "ml" && e.malayalamTitle ? e.malayalamTitle : e.title}</div>
                      <div className="text-xs text-kerala-muted mt-1 line-clamp-2">{e.startsAt ? new Intl.DateTimeFormat(locale === "ml" ? "ml-IN" : "en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" }).format(new Date(e.startsAt)) : e.dateNote ?? te("dateTbc")}</div>
                    </Link>
                  );
                })
              : (ex?.items[activeCat ?? ""] ?? []).map((p) => {
                  const cat = PLACE_CATEGORIES.find((c) => c.key === p.category);
                  return (
                    <Link key={p.id} href={`/district/${d.slug}?cat=${p.category}#places`} className="glass-card-hover p-4 block">
                      <div className="text-[11px] text-emerald-300 font-semibold">{cat?.icon} {cat?.label}</div>
                      <div className="font-newsreader text-base font-bold text-kerala-white mt-1 leading-snug line-clamp-2">{locale === "ml" && p.malayalamName ? p.malayalamName : p.name}</div>
                      {(locale === "ml" ? p.name : p.malayalamName) && <div className="text-xs text-kerala-gold">{locale === "ml" ? p.name : p.malayalamName}</div>}
                      {p.address && <div className="text-xs text-kerala-muted mt-1 line-clamp-1">📍 {p.address}</div>}
                    </Link>
                  );
                })}
          </div>
        </div>
      )}
    </div>
  );
}
