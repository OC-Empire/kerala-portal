import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import CivicBoard from "@/components/civic-board";
import { getLiveNews, type Locale } from "@/lib/feeds";
import { CIVIC_AUTHORITIES, HELPLINES, LINKS_CHECKED } from "@/lib/gov-data";
import { timeAgo } from "@/lib/utils";
import { getIcon } from "@/lib/icons";
import { Phone, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Civic Issues — Kerala Portal",
  description: "Report and track civic issues, find the right authority, and see civic stories from the news.",
};

// stories that are about everyday civic problems
const CIVIC_RE = /pothole|waterlog|water supply|drinking water|water shortage|power cut|power outage|outage|street ?light|garbage|waste|sewage|drain|encroach|road (?:collapse|cave|repair|work)|landslide|flood|traffic|bridge|ksrtc|kseb|water authority|panchayat|corporation|municipal|ശുദ്ധജല|വെള്ളക്കെട്ട്|മാലിന്യ|റോഡ്|വൈദ്യുതി|ഉരുൾ|വെള്ളപ്പൊക്ക/i;

export default async function CivicPage() {
  const locale: Locale = (await cookies()).get("NEXT_LOCALE")?.value === "ml" ? "ml" : "en";
  const news = (await getLiveNews(locale, 60)).filter((n) => CIVIC_RE.test(n.title + " " + n.summary)).slice(0, 6);

  return (
    <div className="space-y-12">
      <CivicBoard />

      {/* Where to report */}
      <section className="space-y-4">
        <div>
          <h2 className="section-heading text-2xl">Who to contact</h2>
          <p className="text-xs md:text-sm text-kerala-muted mt-1 max-w-2xl">
            Posting here raises awareness, but it does not file an official complaint. For action, contact the department responsible.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CIVIC_AUTHORITIES.map((a) => (
            <article key={a.id} className="glass-card p-5 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                {(() => { const I = getIcon(a.icon); return <I className="w-6 h-6 text-kerala-gold shrink-0" aria-hidden />; })()}
                <h3 className="font-newsreader text-lg font-bold text-kerala-white leading-snug">{a.issue}</h3>
              </div>
              <p className="text-sm text-kerala-muted"><strong className="text-kerala-white font-semibold">Who: </strong>{a.who}</p>
              <p className="text-sm text-kerala-muted"><strong className="text-kerala-white font-semibold">How: </strong>{a.how}</p>
              <div className="flex flex-wrap items-center gap-3 mt-auto pt-2">
                {a.number && <a href={`tel:${a.number}`} className="btn-gold text-xs font-semibold px-3 py-1.5 inline-flex items-center gap-1"><Phone className="w-3 h-3" aria-hidden /> {a.number}</a>}
                {a.url && <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-xs text-kerala-light hover:underline font-semibold">Official site ↗</a>}
              </div>
            </article>
          ))}
        </div>
        <details className="glass-card p-4 text-sm">
          <summary className="cursor-pointer font-semibold text-kerala-white">All emergency and helpline numbers</summary>
          <ul className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-2">
            {HELPLINES.map((h) => (
              <li key={h.label} className="flex justify-between gap-3 border-b border-kerala-border/40 pb-1.5">
                <span className="text-kerala-muted">{h.label}{h.note && <span className="block text-[11px] text-kerala-muted/70">{h.note}</span>}</span>
                <a href={`tel:${h.number.replace(/\s/g, "")}`} className="font-bold text-kerala-gold whitespace-nowrap">{h.number}</a>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-kerala-muted mt-3">Numbers and links checked on {LINKS_CHECKED}. Some come from secondary sources, so confirm on the official site if a call doesn't connect.</p>
        </details>
      </section>

      {/* From the news */}
      {news.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="section-heading text-2xl flex items-center gap-2"><span className="live-dot" /> Civic stories in the news</h2>
            <p className="text-xs md:text-sm text-kerala-muted mt-1">Everyday civic problems reported by the press, from The Hindu and Mathrubhumi.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {news.map((n) => (
              <Link key={n.id} href={`/news/${n.id}`} className="group glass-card-hover p-4 block">
                <div className="text-[11px] text-kerala-gold mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" aria-hidden /> {n.district} · {timeAgo(n.publishedAt)}</div>
                <h3 className="font-newsreader text-base font-semibold text-kerala-white leading-snug group-hover:text-kerala-gold transition-colors">{n.title}</h3>
                <div className="text-[11px] text-kerala-muted mt-1">{n.source}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
