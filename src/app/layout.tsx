import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import KeralaAI from "@/components/kerala-ai";

export const metadata: Metadata = {
  title: "Kerala Portal — God's Own Country",
  description: "News, districts, tourism, civic issues and more for Kerala.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">{children}</main>
        <Footer />
        <KeralaAI />
      </body>
    </html>
  );
}