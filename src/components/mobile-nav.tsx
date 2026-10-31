"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/constants";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden text-kerala-white text-xl px-2"
        aria-label="Open menu"
      >
        ☰
      </button>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-kerala-dark border-r border-kerala-border p-6">
            <button
              onClick={() => setOpen(false)}
              className="text-kerala-muted mb-6"
              aria-label="Close menu"
            >
              ✕ Close
            </button>
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((l) => {
                const active = pathname === l.href;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      active
                        ? "bg-kerala-green/30 text-kerala-light"
                        : "text-kerala-muted hover:text-kerala-white hover:bg-kerala-card"
                    }`}
                  >
                    <span className="mr-2">{l.icon}</span>
                    {l.label}
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