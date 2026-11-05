import type { Metadata } from "next";
import { NRI_LINKS, NRI_HELPLINES, LINKS_CHECKED } from "@/lib/gov-data";
import { getIcon } from "@/lib/icons";
import { Globe, Phone, CheckCircle, CreditCard, Wallet, Home as HomeIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "NRI Corner — Kerala Portal",
  description: "NORKA, the Pravasi Welfare Board, emigration and consular help for non-resident Keralites.",
};

const TIP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  check: CheckCircle, card: CreditCard, wallet: Wallet, home: HomeIcon,
};
const TIPS = [
  { iconKey: "check", title: "Check a job offer before you go", body: "Use eMigrate to confirm that a recruiting agent is registered and that your emigration clearance is in order before taking a job overseas." },
  { iconKey: "card", title: "Get the Pravasi ID card", body: "The NORKA ID card is the single stop for connecting with the Kerala government and carries accident insurance cover. It is valid for 3 years." },
  { iconKey: "wallet", title: "Join the welfare fund early", body: "The Pravasi Welfare Board's pension and benefits depend on how long you contribute, so starting early matters." },
  { iconKey: "home", title: "Returning home?", body: "NORKA Roots runs services for returnees. Ask the NORKA helpline about current reintegration and skill programmes, since schemes change." },
];

export default function NRIPage() {
  return (
    <div className="space-y-10">
      <header className="glass-card p-6 md:p-8 bg-gradient-to-br from-kerala-surface/70 to-kerala-card/80 border-kerala-green/30">
        <h1 className="font-newsreader text-3xl md:text-4xl font-bold kerala-text-gradient flex items-center gap-3">
          <Globe className="w-8 h-8 text-kerala-gold shrink-0" aria-hidden />
          NRI / Pravasi Corner
        </h1>
        <p className="text-sm md:text-base text-kerala-muted mt-2 max-w-2xl">
          Official services for non-resident Keralites: identity and insurance, welfare and pension, safe migration, and consular help. Kerala Portal is not a government site. These links take you to the official ones.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="section-heading text-2xl">Official services</h2>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {NRI_LINKS.map((s) => (
            <a key={s.title} href={s.url} target="_blank" rel="noopener noreferrer" className="group glass-card-hover p-5 flex flex-col gap-1.5">
              {(() => { const I = getIcon(s.icon); return <I className="w-8 h-8 text-kerala-gold" aria-hidden />; })()}
              <h3 className="font-semibold text-kerala-white group-hover:text-kerala-gold transition-colors">{s.title} <span className="text-kerala-muted text-sm">↗</span></h3>
              <p className="text-sm text-kerala-muted leading-relaxed">{s.desc}</p>
              <div className="text-[11px] text-kerala-muted/80 mt-auto pt-2">{new URL(s.url).hostname}{!s.ok && " · couldn't be checked from our server"}</div>
            </a>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="section-heading text-2xl flex items-center gap-2">
          <Phone className="w-6 h-6 text-kerala-gold" aria-hidden /> NORKA helplines
        </h2>
        <div className="glass-card p-5">
          <ul className="space-y-2">
            {NRI_HELPLINES.map((h) => (
              <li key={h.label} className="flex flex-wrap justify-between gap-3 border-b border-kerala-border/40 pb-2">
                <span className="text-sm text-kerala-muted">{h.label}{h.note && <span className="block text-[11px] text-kerala-muted/70">{h.note}</span>}</span>
                <a href={`tel:${h.number.replace(/[^+\d]/g, "")}`} className="font-bold text-kerala-gold whitespace-nowrap">{h.number}</a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="section-heading text-2xl">Good to know</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {TIPS.map((t) => {
            const TipIcon = TIP_ICONS[t.iconKey];
            return (
              <div key={t.title} className="glass-card p-5">
                {TipIcon && <TipIcon className="w-7 h-7 text-kerala-gold mb-2" aria-hidden />}
                <h3 className="font-semibold text-kerala-white">{t.title}</h3>
                <p className="text-sm text-kerala-muted mt-1 leading-relaxed">{t.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <p className="text-[11px] text-kerala-muted">
        Links and numbers checked on {LINKS_CHECKED}. Fees, cover amounts and pension rates change, so we don't quote them here. Confirm on the official site before paying or applying.
      </p>
    </div>
  );
}
