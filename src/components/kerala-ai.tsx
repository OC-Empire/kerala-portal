"use client";

import { useState } from "react";
import Link from "next/link";

interface KnowledgeTopic {
  keywords: string[];
  reply: string;
  linkText?: string;
  linkHref?: string;
}

const KNOWLEDGE_BASE: KnowledgeTopic[] = [
  {
    keywords: ["kazhakootam", "technopark", "trivandrum", "tvm"],
    reply: "Kazhakootam is Kerala's IT powerhouse, hosting Technopark Phase 1, Phase 3, and Phase 4 (Technocity). Key concerns right now: NH-66 service road widening bottlenecks, summer water deficits in Attipra ward, and drainage upgrades.",
    linkText: "View Thiruvananthapuram & Kazhakootam Hub",
    linkHref: "/district/thiruvananthapuram",
  },
  {
    keywords: ["munnar", "idukki", "hills", "tea"],
    reply: "Munnar sits at 1,600m in Idukki district. Must-sees include Eravikulam National Park (habitat of endangered Nilgiri Tahr), Mattupetty Dam, and Top Station. Best time to visit is Sept to March.",
    linkText: "Explore Idukki District Guide",
    linkHref: "/district/idukki",
  },
  {
    keywords: ["backwater", "alappuzha", "alleppey", "houseboat", "kuttanad"],
    reply: "Alappuzha is the Venice of the East! Houseboat cruises on Vembanad Lake and Punnamada are world-famous. Don't miss Kuttanad farming 1.2m below sea level and the annual Nehru Trophy Snake Boat Race.",
    linkText: "Explore Alappuzha & Kuttanad",
    linkHref: "/district/alappuzha",
  },
  {
    keywords: ["theyyam", "kannur", "fire"],
    reply: "Theyyam is a divine, thousand-year-old spirit invocation ritual unique to North Malabar (Kannur & Kasaragod). The season runs October to May with over 400 unique ancestral and fiery forms.",
    linkText: "Discover Kannur Theyyam Trail",
    linkHref: "/district/kannur",
  },
  {
    keywords: ["food", "dish", "biryani", "sadhya", "cuisine", "taste"],
    reply: "Kerala gastronomy is legendary: Traditional 64-dish Aranmula Sadhya on plantain leaf, Thalassery Dum Biryani with Kaima rice, Karimeen Pollichathu wrapped in banana leaves, and Appam with rich coconut stew.",
    linkText: "Browse Food & Culture Directory",
    linkHref: "/food",
  },
  {
    keywords: ["civic", "problem", "complain", "pothole", "water", "light"],
    reply: "You can report civic breakdowns directly on the Kerala Portal Civic Action Board! Community members can upvote critical grievances to hold local authorities accountable.",
    linkText: "Open Civic Issue Tracker",
    linkHref: "/civic",
  },
  {
    keywords: ["kochi", "cochin", "ernakulam", "infopark", "water metro"],
    reply: "Kochi is Kerala's commercial and contemporary arts capital. Features the historic Fort Kochi Chinese Fishing Nets, the Biennale, SmartCity Kakkanad, and the world's first integrated Electric Water Metro.",
    linkText: "Explore Ernakulam & Kochi Guide",
    linkHref: "/district/ernakulam",
  },
  {
    keywords: ["nri", "pravasi", "norka", "remittance", "gulf"],
    reply: "With over 2.3 million Non-Resident Keralites worldwide, our NRI Corner connects Pravasis with NORKA welfare schemes, returnee reintegration programs, and investment opportunities in Kerala.",
    linkText: "Visit NRI Corner",
    linkHref: "/nri",
  },
];

export default function KeralaAI() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<
    { role: "user" | "ai"; text: string; linkText?: string; linkHref?: string }[]
  >([
    {
      role: "ai",
      text: "Namaskaram! 🙏 I'm KeralaGPT — your intelligent AI guide to God's Own Country. Ask me about Kazhakootam IT updates, tourism itineraries, local foods, civic issues, or district lore!",
    },
  ]);

  const send = () => {
    if (!input.trim()) return;
    const query = input.toLowerCase();

    const matched = KNOWLEDGE_BASE.find((k) =>
      k.keywords.some((w) => query.includes(w))
    );

    let reply =
      "Great question! Kerala has 14 diverse districts ranging from the Malabar coast to the Western Ghats. You can explore our dedicated sections or ask specifically about places like Kazhakootam, Munnar, or Fort Kochi. 🌴";
    let linkText: string | undefined;
    let linkHref: string | undefined;

    if (matched) {
      reply = matched.reply;
      linkText = matched.linkText;
      linkHref = matched.linkHref;
    }

    setMsgs((m) => [
      ...m,
      { role: "user", text: input },
      { role: "ai", text: reply, linkText, linkHref },
    ]);
    setInput("");
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-kerala-green to-emerald-600 text-white shadow-kerala hover:shadow-glow-green transition-all transform hover:scale-105 z-50 flex items-center justify-center text-2xl border border-emerald-400/40"
        aria-label="Open KeralaGPT Assistant"
      >
        🌴
      </button>

      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[92vw] sm:w-96 max-h-[500px] glass-card flex flex-col z-50 border-kerala-green/60 shadow-2xl overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="px-4 py-3 bg-kerala-surface/90 border-b border-kerala-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="live-dot" />
              <div>
                <div className="text-sm font-bold text-kerala-white flex items-center gap-1.5">
                  KeralaGPT <span className="text-[10px] px-1.5 py-0.2 rounded bg-kerala-gold/20 text-kerala-gold">AI v2.0</span>
                </div>
                <div className="text-[10px] text-kerala-muted">Real-time Kerala Knowledge Assistant</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-kerala-muted hover:text-kerala-white text-sm p-1"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[340px]">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`text-xs md:text-sm p-3 rounded-2xl leading-relaxed ${
                  m.role === "ai"
                    ? "bg-kerala-surface/80 border border-kerala-border/80 text-kerala-white"
                    : "bg-kerala-green/40 border border-kerala-green/50 text-white ml-8"
                }`}
              >
                <div>{m.text}</div>
                {m.linkHref && m.linkText && (
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <Link
                      href={m.linkHref}
                      onClick={() => setOpen(false)}
                      className="text-xs text-kerala-gold hover:underline font-semibold flex items-center gap-1"
                    >
                      → {m.linkText}
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-kerala-dark/95 border-t border-kerala-border flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about Kazhakootam, trips, food, civic issues..."
              className="flex-1 bg-kerala-card border border-kerala-border rounded-xl px-3 py-2 text-xs md:text-sm text-kerala-white outline-none focus:border-kerala-green"
            />
            <button
              onClick={send}
              className="btn-primary text-xs md:text-sm px-4 py-2 font-semibold"
            >
              Ask
            </button>
          </div>
        </div>
      )}
    </>
  );
}
