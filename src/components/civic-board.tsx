"use client";

import { useEffect, useState } from "react";
import { DISTRICTS } from "@/lib/districts";

interface Issue {
  id: string;
  title: string;
  description: string;
  district: string;
  subLocation: string;
  category: string;
  status: string;
  upvotes: number;
  createdAt?: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  roads: "🚧 Roads & Transport",
  water: "💧 Water Supply",
  electricity: "⚡ Power & Lighting",
  sanitation: "🗑️ Sanitation & Waste",
  safety: "🚨 Public Safety",
  other: "📌 General Civic",
};

export default function CivicBoard() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/civic")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((d) => { if (!cancelled) setIssues(d.issues ?? []); })
      .catch(() => { if (!cancelled) setLoadError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDistrict, setFormDistrict] = useState("thiruvananthapuram");
  const [formSubLoc, setFormSubLoc] = useState("");
  const [formCat, setFormCat] = useState("roads");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votedIds, setVotedIds] = useState<Record<string, boolean>>({});

  const handleUpvote = async (id: string) => {
    if (votedIds[id]) return;
    setVotedIds((prev) => ({ ...prev, [id]: true }));
    setIssues((prev) =>
      prev.map((item) => (item.id === id ? { ...item, upvotes: item.upvotes + 1 } : item))
    );

    try {
      const res = await fetch(`/api/civic/${id}/upvote`, { method: "POST" });
      // 409 = already voted from this browser: keep the "voted" state but undo the optimistic bump
      if (!res.ok) throw new Error(String(res.status));
    } catch {
      setIssues((prev) =>
        prev.map((item) => (item.id === id ? { ...item, upvotes: Math.max(0, item.upvotes - 1) } : item))
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDesc.trim()) return;

    setIsSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch("/api/civic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          description: formDesc,
          district: formDistrict,
          subLocation: formSubLoc,
          category: formCat,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.issue) {
        setFormError(data.error ?? "Could not submit your report. Please try again.");
        return;
      }
      setIssues((prev) => [data.issue, ...prev]);
      setShowModal(false);
      setFormTitle("");
      setFormDesc("");
      setFormSubLoc("");
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = issues.filter((i) => {
    if (selectedDistrict !== "all" && i.district.toLowerCase() !== selectedDistrict.toLowerCase()) return false;
    if (selectedCategory !== "all" && i.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="live-dot" />
            <span className="text-xs uppercase tracking-wider text-kerala-gold font-bold">
              Citizen Governance Engine · Neon Powered
            </span>
          </div>
          <h1 className="section-heading text-3xl md:text-4xl text-kerala-white">
            Kerala Civic Issue Tracker & Action Board
          </h1>
          <p className="text-kerala-muted text-sm md:text-base mt-2 max-w-2xl">
            Real community monitoring from Kazhakootam IT corridor to Wayanad highlands. Report civic breakdowns, upvote urgent complaints, and demand transparency from local authorities.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-gold whitespace-nowrap self-start md:self-center flex items-center gap-2 shadow-gold"
        >
          <span>📢</span> Report New Issue
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-kerala-muted block mb-1">Filter by District</label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full bg-kerala-card border border-kerala-border rounded-xl px-3 py-2 text-sm text-kerala-white outline-none focus:border-kerala-green"
          >
            <option value="all">🌴 All 14 Districts</option>
            {DISTRICTS.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name} ({d.malayalamName})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-kerala-muted block mb-1">Filter by Problem Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-kerala-card border border-kerala-border rounded-xl px-3 py-2 text-sm text-kerala-white outline-none focus:border-kerala-green"
          >
            <option value="all">⚡ All Categories</option>
            {Object.entries(CATEGORY_ICONS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <div className="bg-kerala-card/60 border border-kerala-border/60 rounded-xl px-4 py-2 w-full flex items-center justify-between text-xs text-kerala-muted">
            <span>Active Issues: <strong className="text-kerala-white">{filtered.length}</strong></span>
            <span>Resolved: <strong className="text-emerald-400">{issues.filter((i) => i.status === "resolved").length}</strong></span>
          </div>
        </div>
      </div>

      {/* Issue List */}
      <div className="space-y-4">
        {loading && <p className="text-sm text-kerala-muted">Loading issues…</p>}
        {loadError && <p role="alert" className="text-sm text-rose-400">Couldn't load issues. Please refresh.</p>}
        {!loading && !loadError && filtered.length === 0 && (
          <p className="text-sm text-kerala-muted">No issues match these filters.</p>
        )}
        {filtered.map((item) => {
          const hasVoted = !!votedIds[item.id];
          return (
            <div
              key={item.id}
              className="glass-card p-5 md:p-6 transition-all hover:border-kerala-green/60 flex flex-col sm:flex-row gap-4 items-start justify-between"
            >
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-kerala-border text-kerala-white font-medium">
                    {CATEGORY_ICONS[item.category] || "📌 Issue"}
                  </span>
                  <span className="text-xs text-kerala-gold font-medium">
                    📍 {item.subLocation || item.district}
                  </span>
                  {/^iss-\d{1,3}$/.test(item.id) && (
                    <span title="Example report that came with the site, not from a citizen" className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-kerala-border text-kerala-muted">Sample</span>
                  )}
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ml-auto sm:ml-0 ${
                      item.status === "resolved"
                        ? "bg-emerald-900/40 text-emerald-300 border border-emerald-700/50"
                        : item.status === "in-progress"
                        ? "bg-amber-900/40 text-amber-300 border border-amber-700/50"
                        : "bg-rose-900/40 text-rose-300 border border-rose-700/50"
                    }`}
                  >
                    {item.status === "resolved" ? "✓ Resolved" : item.status === "in-progress" ? "⏳ In Progress" : "⚠️ Open"}
                  </span>
                </div>

                <h2 className="font-newsreader text-xl font-semibold text-kerala-white">
                  {item.title}
                </h2>
                <p className="text-sm text-kerala-muted leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Upvote button */}
              <button
                onClick={() => handleUpvote(item.id)}
                disabled={hasVoted}
                className={`self-stretch sm:self-center flex sm:flex-col items-center justify-center gap-1.5 px-4 py-3 rounded-xl border transition-all ${
                  hasVoted
                    ? "bg-kerala-green/30 border-kerala-green text-emerald-300 cursor-default"
                    : "bg-kerala-dark/60 hover:bg-kerala-green/20 border-kerala-border text-kerala-white hover:border-kerala-green cursor-pointer"
                }`}
              >
                <span className="text-base sm:text-lg">▲</span>
                <span className="text-xs font-bold">{item.upvotes}</span>
                <span className="text-[10px] text-kerala-muted uppercase tracking-wider">
                  {hasVoted ? "Upvoted" : "Upvote"}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal for reporting */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-lg w-full p-6 md:p-8 space-y-4 border-kerala-gold/40 shadow-gold relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-kerala-muted hover:text-kerala-white text-lg"
            >
              ✕
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📢</span>
              <h3 className="font-newsreader text-2xl font-bold text-kerala-white">
                Report a Civic Grievance
              </h3>
            </div>
            <p className="text-xs text-kerala-muted">
              Submissions are published to the public dashboard and routed to district authorities and local civic forums.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div>
                <label className="text-xs text-kerala-muted block mb-1">Issue Title</label>
                <input
                  required
                  minLength={5}
                  maxLength={120}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Streetlight blackout near Technopark Phase 3 gate"
                  className="w-full bg-kerala-dark border border-kerala-border rounded-xl px-3 py-2 text-sm text-kerala-white outline-none focus:border-kerala-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-kerala-muted block mb-1">District</label>
                  <select
                    value={formDistrict}
                    onChange={(e) => setFormDistrict(e.target.value)}
                    className="w-full bg-kerala-dark border border-kerala-border rounded-xl px-3 py-2 text-sm text-kerala-white outline-none focus:border-kerala-gold"
                  >
                    {DISTRICTS.map((d) => (
                      <option key={d.slug} value={d.slug}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-kerala-muted block mb-1">Category</label>
                  <select
                    value={formCat}
                    onChange={(e) => setFormCat(e.target.value)}
                    className="w-full bg-kerala-dark border border-kerala-border rounded-xl px-3 py-2 text-sm text-kerala-white outline-none focus:border-kerala-gold"
                  >
                    {Object.entries(CATEGORY_ICONS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-kerala-muted block mb-1">Specific Sub-Location / Ward</label>
                <input
                  value={formSubLoc}
                  onChange={(e) => setFormSubLoc(e.target.value)}
                  placeholder="e.g., Kazhakootam NH-66 Service Road, Ward 12"
                  className="w-full bg-kerala-dark border border-kerala-border rounded-xl px-3 py-2 text-sm text-kerala-white outline-none focus:border-kerala-gold"
                />
              </div>

              <div>
                <label className="text-xs text-kerala-muted block mb-1">Description & Details</label>
                <textarea
                  required
                  minLength={10}
                  maxLength={1000}
                  rows={4}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Describe the issue, hazards, duration, and how it impacts local residents..."
                  className="w-full bg-kerala-dark border border-kerala-border rounded-xl px-3 py-2 text-sm text-kerala-white outline-none focus:border-kerala-gold"
                />
              </div>

              {formError && (
                <p role="alert" className="text-xs text-rose-400">{formError}</p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm text-kerala-muted hover:text-kerala-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-gold text-sm px-5 py-2 font-semibold shadow-gold"
                >
                  {isSubmitting ? "Submitting..." : "Publish Grievance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
