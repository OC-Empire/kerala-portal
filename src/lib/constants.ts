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
  { href: "/", key: "dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/news", key: "news", label: "News", icon: "📰" },
  { href: "/sports", key: "sports", label: "Sports", icon: "🏆" },
  { href: "/tourism", key: "tourism", label: "Tourism", icon: "✈️" },
  { href: "/food", key: "food", label: "Food & Culture", icon: "🍽️" },
  { href: "/civic", key: "civic", label: "Civic Issues", icon: "🔧" },
  { href: "/government", key: "government", label: "Govt Services", icon: "🏛️" },
  { href: "/nri", key: "nri", label: "NRI Corner", icon: "🌍" },
] as const;

export const WEATHER_DISTRICTS = [
  "Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur",
  "Kollam", "Alappuzha", "Kottayam", "Palakkad",
] as const;

export const BREAKING_NEWS_INTERVAL = 30_000; // ms
export const NEWS_REFRESH_INTERVAL = 60_000; // ms