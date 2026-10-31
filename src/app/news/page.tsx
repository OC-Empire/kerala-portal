"use client";

import { useState, useEffect } from "react";
import { MOCK_NEWS } from "@/lib/news";
import { CATEGORY_META } from "@/lib/news";
import { DISTRICTS } from "@/lib/districts";
import { timeAgo } from "@/lib/utils";
import type { NewsCategory } from "@/lib/news";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  district: string;
  subLocation?: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
  url: string;
  isBreaking?: boolean;
}

export default function NewsPage() {
  const [category, setCategory] = useState<NewsCategory>("all");
  const [district, setDistrict] = useState<string>("all");
  const [news, setNews] = useState<NewsItem[]>(MOCK_NEWS as any);
  const [selected, setSelected] = useState<NewsItem | null>(null);
  const [synopsis, setSynopsis] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [loadingSynopsis, setLoadingSynopsis] = useState(false);

  useEffect(() => {
    if (!selected) { setSynopsis(null); setContent(null); return; }
    if (selected.summary) { setSynopsis(selected.summary); }
    setLoadingSynopsis(true);
    setSynopsis(null);
    setContent(null);
    fetch(`/api/article-preview?url=${encodeURIComponent(selected.url)}`)
      .then((r) => r.json())
      .then((d) => { setSynopsis(d.synopsis); setContent(d.content); })
      .catch(() => {})
      .finally(() => setLoadingSynopsis(false));
  }, [selected]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (district !== "all") params.set("district", district);
    fetch(`/api/news?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => { if (d.news) setNews(d.news); })
      .catch(() => {});
  }, [category, district]);

  return (
    <div className="space-y-6">
      <h1 className="section-heading">Kerala News Hub</h1>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(CATEGORY_META) as NewsCategory[]).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              category === c
                ? "bg-kerala-green text-white"
                : "bg-kerala-card text-kerala-muted hover:text-kerala-white"
            }`}
          >
            {CATEGORY_META[c].label}
          </button>
        ))}
      </div>
      <div>
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="bg-kerala-card border border-kerala-border rounded-lg px-3 py-2 text-sm text-kerala-white"
        >
          <option value="all">All Districts</option>
          {DISTRICTS.map((d) => (
            <option key={d.id} value={d.name}>{d.name}</option>
          ))}
        </select>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {news.map((n) => (
          <button
            key={n.id}
            onClick={() => setSelected(n)}
            className="text-left block w-full"
          >
            <article className="glass-card-hover p-5 h-full">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_META[n.category as NewsCategory]?.bg ?? "bg-kerala-border"} ${CATEGORY_META[n.category as NewsCategory]?.color ?? "text-kerala-white"}`}>
                  {CATEGORY_META[n.category as NewsCategory]?.label ?? n.category}
                </span>
                <span className="text-xs text-kerala-muted">{n.district}</span>
                <span className="text-xs text-kerala-muted ml-auto">{timeAgo(n.publishedAt)}</span>
              </div>
              <h3 className="font-newsreader text-lg font-semibold text-kerala-white">{n.title}</h3>
              {n.summary && <p className="text-sm text-kerala-muted mt-1 line-clamp-2">{n.summary}</p>}
              <div className="text-xs text-kerala-muted mt-3">{n.source}</div>
            </article>
          </button>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-newsreader text-xl">{selected.title}</DialogTitle>
                <DialogDescription className="text-kerala-muted">
                  {selected.source} · {selected.district} · {timeAgo(selected.publishedAt)}
                </DialogDescription>
              </DialogHeader>
              {selected.imageUrl && (
                <img src={selected.imageUrl} alt={selected.title} className="w-full rounded-lg max-h-64 object-cover" />
              )}
              <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-2">
                {loadingSynopsis && <p className="text-sm text-kerala-muted">Loading article...</p>}
                {!loadingSynopsis && (content || synopsis || selected.summary) && (
                  <div className="text-sm text-kerala-white leading-relaxed whitespace-pre-line">
                    {content || synopsis || selected.summary}
                  </div>
                )}
                {!loadingSynopsis && !content && !synopsis && !selected.summary && (
                  <p className="text-sm text-kerala-muted">No content available. Click below to read the full article.</p>
                )}
              </div>
              <DialogFooter>
                <a
                  href={selected.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-block"
                >
                  Read Full Article →
                </a>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}