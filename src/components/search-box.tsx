"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";

type Results = {
  districts: { slug: string; name: string; malayalamName: string; tagline: string }[];
  places: { name: string; district: string; slug: string; kind: string }[];
  news: { id: string; title: string; district: string; source: string }[];
  civic: { id: string; title: string; district: string; upvotes: number }[];
  events: { id: string; title: string; district: string; sport: string | null; category: string }[];
};
type Row = { key: string; group: string; title: string; sub: string; href: string };

export default function SearchBox() {
  const t = useTranslations("search");
  const router = useRouter();
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // "/" focuses the search box
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") { e.preventDefault(); inputRef.current?.focus(); }
    };
    const onClick = (e: MouseEvent) => { if (!boxRef.current?.contains(e.target as Node)) setOpen(false); };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("mousedown", onClick); };
  }, []);

  // debounced search
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setRows([]); setLoading(false); return; }
    setLoading(true);
    const ctrl = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal })
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((d: { results: Results }) => {
          const r = d.results;
          setRows([
            ...r.districts.map((x) => ({ key: "d" + x.slug, group: t("districts"), title: x.name, sub: x.malayalamName, href: `/district/${x.slug}` })),
            ...r.places.map((x, i) => ({ key: "p" + i + x.name, group: t("places"), title: x.name, sub: x.district, href: `/district/${x.slug}` })),
            ...r.news.map((x) => ({ key: "n" + x.id, group: t("news"), title: x.title, sub: `${x.district} · ${x.source}`, href: `/news/${x.id}` })),
            ...(r.events ?? []).map((x) => ({ key: "e" + x.id, group: t("events"), title: x.title, sub: x.district, href: x.category === "sports" ? "/sports" : "/news" })),
            ...r.civic.map((x) => ({ key: "c" + x.id, group: t("civic"), title: x.title, sub: `${x.upvotes} ▲`, href: `/civic` })),
          ]);
          setActive(0);
        })
        .catch((e) => { if (e?.name !== "AbortError") setRows([]); })
        .finally(() => setLoading(false));
    }, 220);
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [q, t]);

  const go = (row?: Row) => {
    if (!row) return;
    setOpen(false); setQ("");
    router.push(row.href);
  };

  const grouped = useMemo(() => {
    const m = new Map<string, Row[]>();
    rows.forEach((r) => m.set(r.group, [...(m.get(r.group) ?? []), r]));
    return [...m.entries()];
  }, [rows]);

  const showPanel = open && q.trim().length >= 2;

  return (
    <div ref={boxRef} className="relative w-full max-w-xl mx-auto text-left">
      <div className="flex items-center gap-2 rounded-2xl border border-kerala-border bg-kerala-dark/70 px-4 py-3 focus-within:border-kerala-gold/70 focus-within:shadow-[0_0_0_3px_rgba(232,160,32,0.15)] transition-all">
        <Search className="w-4 h-4 text-kerala-muted shrink-0" aria-hidden />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, rows.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            else if (e.key === "Enter") { go(rows[active]); }
            else if (e.key === "Escape") { setOpen(false); inputRef.current?.blur(); }
          }}
          placeholder={t("placeholder")}
          aria-label={t("placeholder")}
          role="combobox"
          aria-expanded={showPanel}
          aria-controls="search-results"
          maxLength={60}
          className="flex-1 bg-transparent outline-none text-sm text-kerala-white placeholder:text-kerala-muted"
        />
        <kbd className="hidden sm:block text-[10px] text-kerala-muted border border-kerala-border rounded px-1.5 py-0.5">/</kbd>
      </div>

      {showPanel && (
        <div id="search-results" role="listbox" className="absolute z-40 mt-2 w-full max-h-[60vh] overflow-y-auto rounded-2xl border border-kerala-border bg-kerala-card shadow-2xl p-2">
          {loading && rows.length === 0 && <p className="px-3 py-2 text-xs text-kerala-muted">{t("searching")}</p>}
          {!loading && rows.length === 0 && <p className="px-3 py-3 text-sm text-kerala-muted">{t("none", { q: q.trim() })}</p>}
          {grouped.map(([group, list]) => (
            <div key={group} className="mb-1">
              <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-kerala-gold font-semibold">{group}</div>
              {list.map((r) => {
                const idx = rows.indexOf(r);
                return (
                  <button
                    key={r.key}
                    role="option"
                    aria-selected={idx === active}
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => go(r)}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-colors ${idx === active ? "bg-kerala-green/25" : "hover:bg-kerala-surface"}`}
                  >
                    <div className="text-sm text-kerala-white line-clamp-1">{r.title}</div>
                    <div className="text-[11px] text-kerala-muted line-clamp-1">{r.sub}</div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
