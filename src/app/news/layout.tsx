import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "News — Kerala Portal",
  description: "Latest Kerala news across politics, tech, culture, and more.",
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}