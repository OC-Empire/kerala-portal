import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { DISTRICT_BY_SLUG } from "@/lib/districts";
import { eventMeta, sportMeta } from "@/lib/places";
import { getIcon } from "@/lib/icons";
import { safeHref } from "@/lib/safe-url";
import type { EventItem } from "@/lib/events-data";
import { MapPin, Calendar as CalendarIcon, Landmark as VenueIcon } from "lucide-react";

const TZ = "Asia/Kolkata";

function fmt(iso: string, locale: string, opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(locale === "ml" ? "ml-IN" : "en-IN", { timeZone: TZ, ...opts }).format(new Date(iso));
}

export default function EventCard({ event: e }: { event: EventItem }) {
  const t = useTranslations("events");
  const locale = useLocale();
  const cat = eventMeta(e.category);
  const sport = e.category === "sports" ? sportMeta(e.sport) : null;
  const district = e.districtSlug ? DISTRICT_BY_SLUG[e.districtSlug] : null;
  const title = locale === "ml" && e.malayalamTitle ? e.malayalamTitle : e.title;
  const link = safeHref(e.website) ?? safeHref(e.sourceUrl);

  let when: string;
  if (e.startsAt) {
    const sameDay = !e.endsAt || fmt(e.startsAt, locale, { dateStyle: "short" }) === fmt(e.endsAt, locale, { dateStyle: "short" });
    when = sameDay
      ? fmt(e.startsAt, locale, { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })
      : `${fmt(e.startsAt, locale, { day: "numeric", month: "short" })} – ${fmt(e.endsAt!, locale, { day: "numeric", month: "short", year: "numeric" })}`;
  } else {
    when = e.dateNote ?? t("dateTbc");
  }

  return (
    <article className="glass-card-hover p-4 md:p-5 flex gap-4">
      <div className="shrink-0 w-14 text-center rounded-xl bg-kerala-dark/70 border border-kerala-border/70 py-2 self-start" aria-hidden>
        {e.startsAt ? (
          <>
            <div className="text-xl font-bold gold-text-gradient leading-none">{fmt(e.startsAt, locale, { day: "numeric" })}</div>
            <div className="text-[10px] uppercase text-kerala-muted mt-1">{fmt(e.startsAt, locale, { month: "short" })}</div>
          </>
        ) : (
          <>
            <CalendarIcon className="w-5 h-5 text-kerala-gold mx-auto" aria-hidden />
            <div className="text-[10px] uppercase text-kerala-muted mt-1">{t("tbc")}</div>
          </>
        )}
      </div>

      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="px-2 py-0.5 rounded-full bg-kerala-green/20 text-emerald-300 font-semibold inline-flex items-center gap-1">
            {(() => { const m = sport ?? cat; const I = getIcon(m.icon); return <><I className="w-3 h-3" aria-hidden /> {m.label}</>; })()}
          </span>
          {district ? (
            <Link href={`/district/${district.slug}`} className="text-kerala-gold hover:underline inline-flex items-center gap-0.5"><MapPin className="w-3 h-3" aria-hidden /> {district.name}</Link>
          ) : (
            <span className="text-kerala-muted inline-flex items-center gap-0.5"><MapPin className="w-3 h-3" aria-hidden /> {t("statewide")}</span>
          )}
          {e.status === "cancelled" && <span className="px-2 py-0.5 rounded-full bg-rose-900/40 text-rose-300">{t("cancelled")}</span>}
        </div>

        <h3 className="font-newsreader text-lg font-bold text-kerala-white leading-snug">{title}</h3>
        <div className="text-xs text-kerala-gold">{when}</div>
        {e.venue && <div className="text-xs text-kerala-muted flex items-center gap-1"><VenueIcon className="w-3 h-3" aria-hidden /> {e.venue}</div>}
        {e.description && <p className="text-sm text-kerala-muted leading-relaxed line-clamp-3">{e.description}</p>}

        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
          {link && (
            <a href={link} target="_blank" rel="noopener noreferrer" className="text-kerala-light hover:underline font-semibold">
              {t("officialSite")} ↗
            </a>
          )}
          {!e.verified && <span className="text-kerala-muted/80">{t("unverified")}</span>}
        </div>
      </div>
    </article>
  );
}
