"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALE_COOKIE, type Locale } from "@/i18n/routing";

const LABELS: Record<Locale, string> = { en: "EN", ml: "മലയാളം" };

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const t = useTranslations("nav");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const next: Locale = locale === "en" ? "ml" : "en";

  const switchLocale = () => {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => router.refresh());
  };

  return (
    <button
      onClick={switchLocale}
      disabled={pending}
      aria-label={`${t("language")}: ${LABELS[next]}`}
      className="px-2.5 py-1 rounded-lg border border-kerala-border text-xs text-kerala-muted hover:text-kerala-white hover:bg-kerala-card transition-colors"
    >
      🌐 {LABELS[next]}
    </button>
  );
}
