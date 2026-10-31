import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import KeralaAI from "@/components/kerala-ai";
import { Geist, Noto_Sans_Malayalam } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const malayalam = Noto_Sans_Malayalam({ subsets: ["malayalam"], variable: "--font-ml", display: "swap" });

export const metadata: Metadata = {
  title: "Kerala Portal — God's Own Country",
  description: "News, districts, tourism, civic issues and more for Kerala.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale} className={cn("font-sans", geist.variable, malayalam.variable)}>
      <body className={cn("min-h-screen flex flex-col", locale === "ml" && "font-[family-name:var(--font-ml)]")}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Navbar />
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">{children}</main>
          <Footer />
          <KeralaAI />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
