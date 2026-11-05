"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/constants";
import { useTranslations } from "next-intl";
import { Menu, X, Home, Newspaper, Trophy, Plane, Wrench, Landmark, Globe } from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Home, Newspaper, Trophy, Plane, Wrench, Landmark, Globe,
};

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("nav");
  const closeRef = useRef<HTMLButtonElement>(null);
  const asideRef = useRef<HTMLElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Focus trap: keep Tab within the drawer while open
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { close(); return; }
      if (e.key !== "Tab" || !asideRef.current) return;
      const focusable = asideRef.current.querySelectorAll<HTMLElement>("a,button,[tabindex]");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="xl:hidden text-kerala-white p-2 rounded-lg hover:bg-kerala-card transition-colors"
        aria-label={t("openMenu")}
      >
        <Menu className="w-5 h-5" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 xl:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60" onClick={close} />
          <aside ref={asideRef} className="absolute left-0 top-0 h-full w-72 bg-kerala-dark border-r border-kerala-border p-6">
            <button
              ref={closeRef}
              onClick={close}
              className="flex items-center gap-1.5 text-kerala-muted mb-6 p-1 rounded-lg hover:bg-kerala-card transition-colors"
              aria-label={t("close")}
            >
              <X className="w-4 h-4" /> {t("close")}
            </button>
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((l) => {
                const active = pathname === l.href;
                const Icon = ICON_MAP[l.icon];
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={close}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      active
                        ? "bg-kerala-green/30 text-kerala-light"
                        : "text-kerala-muted hover:text-kerala-white hover:bg-kerala-card"
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4" aria-hidden />}
                    {t(l.key)}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}