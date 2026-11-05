"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/constants";
import MobileNav from "@/components/mobile-nav";
import LanguageSwitcher from "@/components/language-switcher";
import { useTranslations } from "next-intl";
import { Home, Newspaper, Trophy, Plane, Wrench, Landmark, Globe, Palmtree } from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Home, Newspaper, Trophy, Plane, Wrench, Landmark, Globe,
};

export default function Navbar() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tHome = useTranslations("home");
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-kerala-dark/80 border-b border-kerala-border">
      <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Palmtree className="w-6 h-6 text-kerala-green" aria-hidden />
          <span className="font-newsreader text-xl font-semibold kerala-text-gradient">
            {tHome("title")}
          </span>
        </Link>
        <div className="hidden xl:flex items-center gap-1">
          {NAV_LINKS.map((l) => {
            const active = pathname === l.href;
            const Icon = ICON_MAP[l.icon];
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
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
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <MobileNav />
        </div>
      </nav>
    </header>
  );
}