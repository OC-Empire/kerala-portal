"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { CATEGORY_META, type NewsCategory } from "@/lib/news";
import { DISTRICTS } from "@/lib/districts";
import { timeAgo } from "@/lib/utils";
import NewsThumb from "@/components/news-thumb";

interface Story {
  id: string;
  title: string;
  summary: string;
  category: NewsCategory;
  district: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
}

// recent stories read "2h ago"; older ones get a real date
function when(iso: string) {
  const age = Date.now() - new Date(iso).getTime();
  return age < 3 * 24 * 3600_000
    ? timeAgo(iso)
    : new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
}

export default function NewsPage() {
  const t = useTranslations("news");
  const [category, setCategory] = useState<NewsCategory>("all");
  const [district, setDistrict] = useState("all");
  const [query, setQuery] = useState("");
  const [q, setQ] = useState(""); // debounced
  const [news, setNews] = useState<Story[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [since, setSince] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [loadingMore, setLoadingMore] = useState(false);
  const reqId = useRef(0);

  useEffect(() => { const h = setTimeout(() => setQ(query.trim()), 300); return () => clearTimeout(h); }, [query]);

  const fetchPage = useCallback(async (offset: number, signal?: AbortSignal) => {
    const params = new URLSearchParams({ offset: String(offset) });
    if (category !== "all") params.set("category", category);
    if (district !== "all") params.set("district", district);
    if (q) params.set("q", q);
    const r = await fetch(`/api/news?${params}`, { signal });
    if (!r.ok) throw new Error(String(r.status));
    return r.json();
  }, [category, district, q]);

  // new filters -> start again from page one
  useEffect(() => {
    const ctrl = new AbortController(); const id = ++reqId.current;
    setState("loading");
    fetchPage(0, ctrl.signal)
      .then((d) => { if (id !== reqId.current) return; setNews(d.news ?? []); setTotal(d.total ?? 0); setHasMore(!!d.hasMore); setSince(d.since ?? null); setState("ready"); })
      .catch((e) => { if (e?.name !== "AbortError") setState("error"); });
    return () => ctrl.abort();
  }, [fetchPage]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const d = await fetchPage(news.length);
      setNews((prev) => [...prev, ...(d.news ?? []).filter((n: Story) => !prev.some((p) => p.id === n.id))]);
      setHasMore(!!d.hasMore);
    } catch { /* keep what we have */ } finally { setLoadingMore(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-heading flex items-center gap-2"><span className="live-dot" /> Kerala News Hub</h1>
        <p className="text-xs text-kerala-muted mt-1">
          {t("live")}
          {since && <> · {t("archiveSince", { date: new Date(since).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }) })}</>}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(CATEGORY_META) as NewsCategory[]).map((c) => (
          <button key={c} onClick={() => setCategory(c)} aria-pressed={category === c}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${category === c ? "bg-kerala-green text-white" : "bg-kerala-card text-kerala-muted hover:text-kerala-white"}`}>
            {CATEGORY_META[c].label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={district} onChange={(e) => setDistrict(e.target.value)} aria-label="District"
          className="bg-kerala-card border border-kerala-border rounded-lg px-3 py-2 text-sm text-kerala-white">
          <option value="all">All Districts</option>
          {DISTRICTS.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
        </select>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("searchStories")} aria-label={t("searchStories")} maxLength={80}
          className="flex-1 min-w-[200px] bg-kerala-card border border-kerala-border rounded-lg px-3 py-2 text-sm text-kerala-white placeholder:text-kerala-muted outline-none focus:border-kerala-gold/70" />
      </div>

      {state === "loading" && <p className="text-sm text-kerala-muted">Loading…</p>}
      {state === "error" && <p role="alert" className="text-sm text-rose-400">{t("unavailable")}</p>}
      {state === "ready" && news.length === 0 && <p className="text-sm text-kerala-muted">No stories match these filters right now.</p>}
      {state === "ready" && news.length > 0 && <p className="text-xs text-kerala-muted">{t("showing", { shown: news.length, total })}</p>}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {news.map((n) => {
          const m = CATEGORY_META[n.category] ?? CATEGORY_META.general;
          return (
            <Link key={n.id} href={`/news/${n.id}`} className="group glass-card-hover overflow-hidden flex flex-col">
              {n.imageUrl && <NewsThumb src={n.imageUrl} className="h-40" />}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${m.bg} ${m.color}`}>{m.label}</span>
                  <span className="text-xs text-kerala-gold">📍 {n.district}</span>
                  <span className="text-xs text-kerala-muted ml-auto">{when(n.publishedAt)}</span>
                </div>
                <h3 className="font-newsreader text-lg font-semibold text-kerala-white group-hover:text-kerala-gold transition-colors">{n.title}</h3>
                {n.summary && <p className="text-sm text-kerala-muted mt-1 line-clamp-2">{n.summary}</p>}
                <div className="text-xs text-kerala-muted mt-auto pt-3">{n.source}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {state === "ready" && hasMore && (
        <div className="text-center pt-2">
          <button onClick={loadMore} disabled={loadingMore} className="btn-primary text-sm font-semibold px-6 py-2.5 disabled:opacity-60">
            {loadingMore ? t("loadingMore") : t("loadMore")}
          </button>
        </div>
      )}
    </div>
  );
}
