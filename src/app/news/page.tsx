"use client";

import { useState } from "react";
import { MOCK_NEWS } from "@/lib/news";
import { CATEGORY_META } from "@/lib/news";
import { timeAgo } from "@/lib/utils";
import type { NewsCategory } from "@/lib/news";

export default function NewsPage() {
  const [category, setCategory] = useState<NewsCategory>("all");
  const filtered = category === "all" ? MOCK_NEWS : MOCK_NEWS.filter((n) => n.category === category);

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
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((n) => (
          <article key={n.id} className="glass-card-hover p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_META[n.category].bg} ${CATEGORY_META[n.category].color}`}>
                {CATEGORY_META[n.category].label}
              </span>
              <span className="text-xs text-kerala-muted">{n.district}</span>
              <span className="text-xs text-kerala-muted ml-auto">{timeAgo(n.publishedAt)}</span>
            </div>
            <h3 className="font-newsreader text-lg font-semibold text-kerala-white">{n.title}</h3>
            <p className="text-sm text-kerala-muted mt-1">{n.summary}</p>
            <div className="text-xs text-kerala-muted mt-3">{n.source}</div>
          </article>
        ))}
      </div>
    </div>
  );
}