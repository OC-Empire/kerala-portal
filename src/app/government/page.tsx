import type { Metadata } from "next";
import { GOV_GROUPS, HELPLINES, LINKS_CHECKED } from "@/lib/gov-data";
import { getIcon } from "@/lib/icons";
import { Landmark, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Government Services — Kerala Portal",
  description: "Official Kerala government portals and helplines, grouped by what you need to do.",
};

export default function GovernmentPage() {
  return (
    <div className="space-y-10">
      <header className="glass-card p-6 md:p-8 bg-gradient-to-br from-kerala-surface/70 to-kerala-card/80 border-kerala-green/30">
        <h1 className="font-newsreader text-3xl md:text-4xl font-bold kerala-text-gradient flex items-center gap-3">
          <Landmark className="w-8 h-8 text-kerala-gold shrink-0" aria-hidden />
          Government Services
        </h1>
        <p className="text-sm md:text-base text-kerala-muted mt-2 max-w-2xl">
          Official Kerala and national portals, grouped by what you need to do. Kerala Portal is not a government site: these links take you to the official ones.
        </p>
        <nav aria-label="Service groups" className="flex flex-wrap gap-2 mt-4">
          {GOV_GROUPS.map((g) => (
            <a key={g.id} href={`#${g.id}`} className="text-xs px-3 py-1.5 rounded-full border border-kerala-border text-kerala-muted hover:text-kerala-white hover:bg-kerala-card transition-colors inline-flex items-center gap-1">{(() => { const I = getIcon(g.icon); return <I className="w-3.5 h-3.5" aria-hidden />; })()} {g.title}</a>
          ))}
          <a href="#helplines" className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-kerala-gold/40 text-kerala-gold hover:bg-kerala-card transition-colors">
            <Phone className="w-3 h-3" aria-hidden /> Helplines
          </a>
        </nav>
      </header>

      {GOV_GROUPS.map((g) => (
        <section key={g.id} id={g.id} className="space-y-4 scroll-mt-24">
          <h2 className="section-heading text-2xl flex items-center gap-2">{(() => { const I = getIcon(g.icon); return <I className="w-6 h-6 text-kerala-gold" aria-hidden />; })()} {g.title}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {g.items.map((s) => (
              <a key={s.title} href={s.url} target="_blank" rel="noopener noreferrer" className="group glass-card-hover p-5 flex flex-col gap-1.5">
                {(() => { const I = getIcon(s.icon); return <I className="w-8 h-8 text-kerala-gold" aria-hidden />; })()}
                <h3 className="font-semibold text-kerala-white group-hover:text-kerala-gold transition-colors">{s.title} <span className="text-kerala-muted text-sm">↗</span></h3>
                <p className="text-sm text-kerala-muted leading-relaxed">{s.desc}</p>
                <div className="text-[11px] text-kerala-muted/80 mt-auto pt-2">{new URL(s.url).hostname}{!s.ok && " · couldn't be checked from our server"}</div>
              </a>
            ))}
          </div>
        </section>
      ))}

      <section id="helplines" className="space-y-4 scroll-mt-24">
        <h2 className="section-heading text-2xl flex items-center gap-2">
          <Phone className="w-6 h-6 text-kerala-gold" aria-hidden /> Helplines
        </h2>
        <div className="glass-card p-5">
          <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
            {HELPLINES.map((h) => (
              <li key={h.label} className="flex justify-between gap-3 border-b border-kerala-border/40 pb-2">
                <span className="text-sm text-kerala-muted">{h.label}{h.note && <span className="block text-[11px] text-kerala-muted/70">{h.note}</span>}</span>
                <a href={`tel:${h.number.replace(/\s/g, "")}`} className="font-bold text-kerala-gold whitespace-nowrap">{h.number}</a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <p className="text-[11px] text-kerala-muted">
        Links and numbers checked on {LINKS_CHECKED}. Government sites sometimes block checks from outside India, so a link marked "couldn't be checked" may still work for you. Numbers from secondary sources should be confirmed on the official site.
      </p>
    </div>
  );
}
