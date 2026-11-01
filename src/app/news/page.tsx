"use client";

import { useEffect, useState } from "react";
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

export default function NewsPage() {
  const t = useTranslations("news");
  const [category, setCategory] = useState<NewsCategory>("all");
  const [district, setDistrict] = useState("all");
  const [news, setNews] = useState<Story[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const ctrl = new AbortController();
    setState("loading");
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (district !== "all") params.set("district", district);
    fetch(`/api/news?${params}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => { setNews(d.news ?? []); setState("ready"); })
      .catch((e) => { if (e?.name !== "AbortError") setState("error"); });
    return () => ctrl.abort();
  }, [category, district]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-heading flex items-center gap-2"><span className="live-dot" /> Kerala News Hub</h1>
        <p className="text-xs text-kerala-muted mt-1">{t("live")}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(CATEGORY_META) as NewsCategory[]).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              category === c ? "bg-kerala-green text-white" : "bg-kerala-card text-kerala-muted hover:text-kerala-white"
            }`}
          >
            {CATEGORY_META[c].label}
          </button>
        ))}
      </div>

      <select
        value={district}
        onChange={(e) => setDistrict(e.target.value)}
        aria-label="District"
        className="bg-kerala-card border border-kerala-border rounded-lg px-3 py-2 text-sm text-kerala-white"
      >
        <option value="all">All Districts</option>
        {DISTRICTS.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
      </select>

      {state === "loading" && <p className="text-sm text-kerala-muted">Loading…</p>}
      {state === "error" && <p role="alert" className="text-sm text-rose-400">{t("unavailable")}</p>}
      {state === "ready" && news.length === 0 && (
        <p className="text-sm text-kerala-muted">No stories match these filters right now.</p>
      )}

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
                  <span className="text-xs text-kerala-muted ml-auto">{timeAgo(n.publishedAt)}</span>
                </div>
                <h3 className="font-newsreader text-lg font-semibold text-kerala-white group-hover:text-kerala-gold transition-colors">{n.title}</h3>
                {n.summary && <p className="text-sm text-kerala-muted mt-1 line-clamp-2">{n.summary}</p>}
                <div className="text-xs text-kerala-muted mt-auto pt-3">{n.source}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
