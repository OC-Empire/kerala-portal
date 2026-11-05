export const SITE_NAME = "Kerala Portal";
export const SITE_TAGLINE = "God's Own Country — In Your Pocket";
export const SITE_URL = "https://kerala-portal.vercel.app";

export const KERALA_COLORS = {
  green: "#1B6B3A",
  light: "#2E8B57",
  gold: "#E8A020",
  red: "#D94F2B",
  dark: "#0A1628",
  surface: "#0F2744",
  card: "#162035",
  white: "#F9F5EE",
  muted: "#94A3B8",
  border: "#1E3A5F",
} as const;

export const NAV_LINKS = [
  { href: "/", key: "dashboard", label: "Dashboard", icon: "Home" },
  { href: "/news", key: "news", label: "News", icon: "Newspaper" },
  { href: "/sports", key: "sports", label: "Sports", icon: "Trophy" },
  { href: "/tourism", key: "tourism", label: "Tourism", icon: "Plane" },
  { href: "/civic", key: "civic", label: "Civic Issues", icon: "Wrench" },
  { href: "/government", key: "government", label: "Govt Services", icon: "Landmark" },
  { href: "/nri", key: "nri", label: "NRI Corner", icon: "Globe" },
] as const;

export const WEATHER_DISTRICTS = [
  "Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur",
  "Kollam", "Alappuzha", "Kottayam", "Palakkad",
] as const;

export const BREAKING_NEWS_INTERVAL = 30_000; // ms
export const NEWS_REFRESH_INTERVAL = 60_000; // ms