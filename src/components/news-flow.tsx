"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Clock } from "lucide-react";
import { CATEGORY_META } from "@/lib/news";
import type { LiveNewsItem } from "@/lib/feeds";

function timeAgo(iso: string): string {
  const ms = Date.now() - +new Date(iso);
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const item = {
  hidden: { opacity: 0, x: -24 },
  show: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.07, duration: 0.4, type: "spring", stiffness: 100, damping: 15 },
  }),
};

export default function NewsFlow({ items, heading, cta }: { items: LiveNewsItem[]; heading: string; cta: string }) {
  const display = items.slice(0, 8);

  if (display.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-heading text-2xl flex items-center gap-2">
          <span className="live-dot" /> {heading}
        </h2>
        <Link href="/news" className="text-xs text-kerala-gold hover:underline font-semibold">{cta}</Link>
      </div>

      <div className="relative">
        {/* Timeline spine */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-kerala-gold/60 via-kerala-green/40 to-transparent" />

        <div className="space-y-3">
          {display.map((n, i) => {
            const meta = CATEGORY_META[n.category] ?? CATEGORY_META.general;
            return (
              <motion.div
                key={n.id}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                variants={item}
              >
                <Link
                  href={`/news/${n.id}`}
                  className="group relative pl-10 block glass-card-hover p-4 border-kerala-border"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-2.5 top-5 w-3 h-3 rounded-full border-2 border-kerala-gold bg-kerala-dark group-hover:bg-kerala-gold transition-colors" />

                  {/* Pulse ring on first item */}
                  {i === 0 && (
                    <div className="absolute left-[7px] top-[17px] w-5 h-5 rounded-full border border-kerala-gold/50 animate-ping pointer-events-none" />
                  )}

                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>{meta.label}</span>
                    <span className="text-[11px] text-kerala-muted flex items-center gap-1">
                      <MapPin className="w-3 h-3" aria-hidden /> {n.district}
                    </span>
                    <span className="text-[11px] text-kerala-muted flex items-center gap-1 ml-auto">
                      <Clock className="w-3 h-3" aria-hidden /> {timeAgo(n.publishedAt)}
                    </span>
                  </div>

                  <h3 className="font-newsreader text-[15px] md:text-base font-semibold text-kerala-white leading-snug group-hover:text-kerala-gold transition-colors line-clamp-2">
                    {n.title}
                  </h3>

                  {n.summary && (
                    <p className="text-xs text-kerala-muted mt-1 line-clamp-1">{n.summary}</p>
                  )}

                  <div className="text-[10px] text-kerala-muted/70 mt-1.5">{n.source}</div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
