import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getBrief } from "@/lib/brief";
import type { LiveNewsItem, Locale } from "@/lib/feeds";

export function DailyBriefSkeleton() {
  return <div className="glass-card h-[168px] animate-pulse border-kerala-border/60" aria-hidden />;
}

export default async function DailyBrief({ news, locale }: { news: LiveNewsItem[]; locale: Locale }) {
  const bullets = await getBrief(locale, news);
  if (bullets.length === 0) return null; // no key / AI down: just don't show the section
  const t = await getTranslations("brief");

  return (
    <section className="glass-card p-5 md:p-6 border-kerala-gold/30 bg-gradient-to-br from-kerala-card/90 to-kerala-surface/60">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <h2 className="font-newsreader text-xl md:text-2xl font-bold text-kerala-white flex items-center gap-2">
          <span aria-hidden>✨</span> {t("title")}
        </h2>
        <span className="text-[10px] uppercase tracking-wider text-kerala-gold border border-kerala-gold/40 rounded-full px-2.5 py-1">{t("badge")}</span>
      </div>
      <ul className="space-y-2.5">
        {bullets.map((b) => (
          <li key={b.storyId}>
            <Link href={`/news/${b.storyId}`} className="group flex gap-3 text-sm md:text-[15px] text-kerala-white/90 leading-relaxed">
              <span className="text-kerala-gold mt-0.5">▸</span>
              <span className="group-hover:text-kerala-gold transition-colors">{b.text}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-kerala-muted mt-3">{t("note")}</p>
    </section>
  );
}
