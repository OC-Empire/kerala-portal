import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Palmtree } from "lucide-react";

export default async function Footer() {
  const t = await getTranslations("footer");
  return (
    <footer className="border-t border-kerala-border mt-16 py-10 text-kerala-muted text-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex items-center gap-2">
            <Palmtree className="w-5 h-5 text-kerala-green" aria-hidden />
            <span className="font-newsreader text-lg font-semibold kerala-text-gradient">Kerala Portal</span>
          </div>
          <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs">
            <Link href="/news" className="hover:text-kerala-white transition-colors">News</Link>
            <Link href="/sports" className="hover:text-kerala-white transition-colors">Sports</Link>
            <Link href="/tourism" className="hover:text-kerala-white transition-colors">Tourism</Link>
            <Link href="/civic" className="hover:text-kerala-white transition-colors">Civic Issues</Link>
            <Link href="/government" className="hover:text-kerala-white transition-colors">Govt Services</Link>
            <Link href="/districts" className="hover:text-kerala-white transition-colors">Districts</Link>
          </nav>
        </div>
        <div className="mt-6 pt-4 border-t border-kerala-border/40 text-center text-xs">
          <p>{t("copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
