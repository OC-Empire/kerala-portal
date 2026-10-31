"use client";

import { useState } from "react";
import { DISTRICTS } from "@/lib/districts";
import Link from "next/link";

type AiPlan = {
  title: string;
  summary: string;
  bestTime: string;
  days: { day: number; title: string; route: string; stops: string[]; food: string; tip: string }[];
};

export default function TourismPlanner() {
  const [days, setDays] = useState(3);
  const [theme, setTheme] = useState("all");

  // AI generator state
  const [aiDays, setAiDays] = useState(3);
  const [aiTheme, setAiTheme] = useState("mixed");
  const [aiStart, setAiStart] = useState("");
  const [aiNotes, setAiNotes] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiPlan, setAiPlan] = useState<AiPlan | null>(null);

  const generate = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: aiDays, theme: aiTheme, start: aiStart, notes: aiNotes }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.plan) {
        setAiError(data.error ?? "Couldn't generate a plan. Please try again.");
        return;
      }
      setAiPlan(data.plan);
    } catch {
      setAiError("Network error. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const itineraries = [
    {
      id: "it-1",
      title: "Royal South & Tech Coast (3 Days)",
      days: 3,
      theme: "coastal",
      route: "Thiruvananthapuram → Kazhakootam → Kovalam → Varkala",
      highlights: [
        "Day 1: Sree Padmanabhaswamy Temple darshan, heritage museum, dinner at East Fort",
        "Day 2: Morning tech visit to Technopark, Kazhakootam beach road, afternoon at Kovalam lighthouse",
        "Day 3: Varkala red laterite cliffs, sunset dinner overlooking Arabian Sea waves",
      ],
      district: "thiruvananthapuram",
    },
    {
      id: "it-2",
      title: "Venice of the East Backwater Odyssey (2 Days)",
      days: 2,
      theme: "backwaters",
      route: "Alappuzha → Kuttanad → Kumarakom",
      highlights: [
        "Day 1: Overnight luxury houseboat cruise on Vembanad Lake with fresh Karimeen fry",
        "Day 2: Canoe boat tour through Kuttanad below-sea-level canals and bird sanctuary",
      ],
      district: "alappuzha",
    },
    {
      id: "it-3",
      title: "Highland Tea & Wildlife Mist Trail (4 Days)",
      days: 4,
      theme: "hills",
      route: "Munnar → Eravikulam → Thekkady Periyar",
      highlights: [
        "Day 1: Scenic drive up through Cheeyappara waterfalls to Munnar tea estates",
        "Day 2: Eravikulam National Park Nilgiri Tahr spotting, tea factory museum",
        "Day 3: Thekkady spice plantation walk, traditional Kalaripayattu martial arts show",
        "Day 4: Early morning bamboo raft boat safari inside Periyar Tiger Reserve",
      ],
      district: "idukki",
    },
    {
      id: "it-4",
      title: "Malabar Heritage, Theyyam & Culinary Trail (3 Days)",
      days: 3,
      theme: "heritage",
      route: "Kozhikode → Thalassery → Kannur",
      highlights: [
        "Day 1: Calicut Beach sunset, SM Street Halwa tasting, authentic Malabar Dum Biryani",
        "Day 2: Tellicherry colonial fort, Beypore 2km sea walk pier, dhow shipyards",
        "Day 3: Witnessing sacred, fiery nocturnal Theyyam spirit-dance in a village temple grove",
      ],
      district: "kannur",
    },
  ];

  const filtered = itineraries.filter((it) => {
    if (theme !== "all" && it.theme !== theme) return false;
    if (days && it.days > days) return false;
    return true;
  });

  return (
    <div className="glass-card p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">✈️</span>
            <h2 className="font-newsreader text-2xl md:text-3xl font-bold text-kerala-white">
              Kerala Itinerary Planner
            </h2>
          </div>
          <p className="text-sm text-kerala-muted">
            Personalize your dream travel route across God's Own Country based on duration and vibe.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[11px] text-kerala-muted block mb-1">Max Duration</label>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="bg-kerala-dark border border-kerala-border rounded-xl px-3 py-1.5 text-xs text-kerala-white outline-none focus:border-kerala-gold"
            >
              <option value={2}>2 Days Express</option>
              <option value={3}>3 Days Classic</option>
              <option value={5}>5+ Days Complete</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-kerala-muted block mb-1">Experience Type</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="bg-kerala-dark border border-kerala-border rounded-xl px-3 py-1.5 text-xs text-kerala-white outline-none focus:border-kerala-gold"
            >
              <option value="all">🌴 All Experiences</option>
              <option value="coastal">🏖️ Coastal & Cliffs</option>
              <option value="backwaters">🛶 Houseboats & Canals</option>
              <option value="hills">⛰️ Tea Mountains & Wildlife</option>
              <option value="heritage">🔥 Theyyam & Culture</option>
            </select>
          </div>
        </div>
      </div>

      {/* AI generator */}
      <div className="bg-kerala-dark/70 border border-kerala-gold/40 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="font-newsreader text-xl font-bold text-kerala-white">✨ Generate a custom plan with AI</h3>
          <p className="text-xs text-kerala-muted mt-1">
            AI-generated suggestions. It has no live data, so check timings, prices and bookings with official sources.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <select value={aiDays} onChange={(e) => setAiDays(Number(e.target.value))} aria-label="Days"
            className="bg-kerala-dark border border-kerala-border rounded-xl px-3 py-2 text-xs text-kerala-white outline-none focus:border-kerala-gold">
            {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{n} day{n > 1 ? "s" : ""}</option>)}
          </select>
          <select value={aiTheme} onChange={(e) => setAiTheme(e.target.value)} aria-label="Theme"
            className="bg-kerala-dark border border-kerala-border rounded-xl px-3 py-2 text-xs text-kerala-white outline-none focus:border-kerala-gold">
            <option value="mixed">🌴 A bit of everything</option>
            <option value="coastal">🏖️ Coastal & Cliffs</option>
            <option value="backwaters">🛶 Backwaters</option>
            <option value="hills">⛰️ Hills & Tea</option>
            <option value="wildlife">🐘 Wildlife</option>
            <option value="heritage">🔥 Heritage & Culture</option>
            <option value="food">🍛 Food trail</option>
          </select>
          <select value={aiStart} onChange={(e) => setAiStart(e.target.value)} aria-label="Starting district"
            className="bg-kerala-dark border border-kerala-border rounded-xl px-3 py-2 text-xs text-kerala-white outline-none focus:border-kerala-gold">
            <option value="">Start anywhere</option>
            {DISTRICTS.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
          </select>
          <button onClick={generate} disabled={aiLoading} className="btn-gold text-xs px-4 py-2 font-semibold disabled:opacity-60">
            {aiLoading ? "Planning…" : "Generate plan"}
          </button>
        </div>
        <input value={aiNotes} onChange={(e) => setAiNotes(e.target.value)} maxLength={200}
          placeholder="Optional: travelling with kids, vegetarian, low budget, avoid long drives…"
          className="w-full bg-kerala-dark border border-kerala-border rounded-xl px-3 py-2 text-xs text-kerala-white outline-none focus:border-kerala-gold" />
        {aiError && <p role="alert" className="text-xs text-rose-400">{aiError}</p>}

        {aiPlan && (
          <div className="space-y-3 pt-2">
            <div>
              <h4 className="font-newsreader text-lg font-bold text-kerala-white">{aiPlan.title}</h4>
              <p className="text-xs text-kerala-muted mt-1">{aiPlan.summary}</p>
              {aiPlan.bestTime && <p className="text-xs text-kerala-gold mt-1">Best time: {aiPlan.bestTime}</p>}
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {aiPlan.days.map((d) => (
                <div key={d.day} className="border border-kerala-border/70 rounded-xl p-4 space-y-1.5">
                  <div className="text-sm font-bold text-kerala-white">Day {d.day}: {d.title}</div>
                  {d.route && <div className="text-[11px] text-kerala-gold">{d.route}</div>}
                  <ul className="text-xs text-kerala-muted space-y-1">
                    {d.stops.map((st, i) => <li key={i} className="flex gap-2"><span className="text-kerala-light">✓</span><span>{st}</span></li>)}
                  </ul>
                  {d.food && <div className="text-xs text-kerala-muted">🍽️ {d.food}</div>}
                  {d.tip && <div className="text-xs text-kerala-muted">💡 {d.tip}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <h3 className="font-newsreader text-lg font-bold text-kerala-white pt-2">Curated routes</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((it) => (
          <div
            key={it.id}
            className="bg-kerala-dark/70 border border-kerala-border/70 hover:border-kerala-green/60 rounded-2xl p-5 flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-kerala-green/20 text-emerald-400 font-semibold">
                  ⏱️ {it.days} Days Itinerary
                </span>
                <span className="text-xs text-kerala-gold font-medium">
                  {it.route}
                </span>
              </div>
              <h3 className="font-newsreader text-xl font-bold text-kerala-white mb-3">
                {it.title}
              </h3>

              <div className="space-y-2">
                {it.highlights.map((h, idx) => (
                  <div key={idx} className="text-xs text-kerala-muted flex items-start gap-2">
                    <span className="text-kerala-light font-bold">✓</span>
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-kerala-border/40 flex items-center justify-between">
              <Link
                href={`/district/${it.district}`}
                className="text-xs text-kerala-gold hover:underline"
              >
                View Base District →
              </Link>
              <button
                onClick={() => alert(`Saved '${it.title}' to your Kerala trip planner.`)}
                className="btn-primary text-xs px-3 py-1.5"
              >
                Bookmark Route
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
