// Shared taxonomy for places & events (safe to import from client and server code).

export const PLACE_CATEGORIES = [
  { key: "school", label: "Schools", icon: "🏫" },
  { key: "college", label: "Colleges & universities", icon: "🎓" },
  { key: "library", label: "Libraries", icon: "📚" },
  { key: "park", label: "Parks & gardens", icon: "🌳" },
  { key: "zoo", label: "Zoos & wildlife", icon: "🦁" },
  { key: "museum", label: "Museums & heritage", icon: "🖼️" },
  { key: "sports_venue", label: "Stadiums & sports venues", icon: "🏟️" },
  { key: "food", label: "Food & flavours", icon: "🍲" },
  { key: "culture", label: "Arts, crafts & traditions", icon: "🎭" },
  { key: "nature", label: "Beaches, waterfalls & nature", icon: "🌊" },
  { key: "hidden_gem", label: "Hidden gems", icon: "💎" },
  { key: "other", label: "Other places", icon: "📍" },
] as const;
export type PlaceCategory = (typeof PLACE_CATEGORIES)[number]["key"];

export const EVENT_CATEGORIES = [
  { key: "sports", label: "Sports", icon: "🏆" },
  { key: "festival", label: "Festivals", icon: "🎆" },
  { key: "culture", label: "Arts & culture", icon: "🎭" },
  { key: "education", label: "Education", icon: "🎓" },
  { key: "community", label: "Community", icon: "🤝" },
  { key: "other", label: "Other events", icon: "📅" },
] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number]["key"];

export const SPORTS = [
  { key: "football", label: "Football", icon: "⚽" },
  { key: "cricket", label: "Cricket", icon: "🏏" },
  { key: "boat_race", label: "Boat racing", icon: "🛶" },
  { key: "athletics", label: "Athletics", icon: "🏃" },
  { key: "other", label: "Other sports", icon: "🏅" },
] as const;
export type SportKey = (typeof SPORTS)[number]["key"];

export const placeMeta = (k: string) => PLACE_CATEGORIES.find((c) => c.key === k) ?? PLACE_CATEGORIES[PLACE_CATEGORIES.length - 1];
export const eventMeta = (k: string) => EVENT_CATEGORIES.find((c) => c.key === k) ?? EVENT_CATEGORIES[EVENT_CATEGORIES.length - 1];
export const sportMeta = (k?: string | null) => SPORTS.find((s) => s.key === k) ?? SPORTS[SPORTS.length - 1];

export const EVENT_STATUSES = ["scheduled", "tbc", "cancelled"] as const;
