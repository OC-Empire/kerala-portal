// Shared taxonomy for places & events (safe to import from client and server code).

export const PLACE_CATEGORIES = [
  { key: "school", label: "Schools", icon: "School" },
  { key: "college", label: "Colleges & universities", icon: "GraduationCap" },
  { key: "library", label: "Libraries", icon: "BookOpen" },
  { key: "park", label: "Parks & gardens", icon: "TreePine" },
  { key: "zoo", label: "Zoos & wildlife", icon: "Squirrel" },
  { key: "museum", label: "Museums & heritage", icon: "Landmark" },
  { key: "sports_venue", label: "Stadiums & sports venues", icon: "Trophy" },
  { key: "food", label: "Food & flavours", icon: "UtensilsCrossed" },
  { key: "restaurant", label: "Famous restaurants", icon: "Utensils" },
  { key: "culture", label: "Arts, crafts & traditions", icon: "Palette" },
  { key: "nature", label: "Beaches, waterfalls & nature", icon: "Waves" },
  { key: "hidden_gem", label: "Hidden gems", icon: "Gem" },
  { key: "other", label: "Other places", icon: "MapPin" },
] as const;
export type PlaceCategory = (typeof PLACE_CATEGORIES)[number]["key"];

export const EVENT_CATEGORIES = [
  { key: "sports", label: "Sports", icon: "Trophy" },
  { key: "festival", label: "Festivals", icon: "Sparkles" },
  { key: "culture", label: "Arts & culture", icon: "Palette" },
  { key: "education", label: "Education", icon: "GraduationCap" },
  { key: "community", label: "Community", icon: "Users" },
  { key: "other", label: "Other events", icon: "Calendar" },
] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number]["key"];

export const SPORTS = [
  { key: "football", label: "Football", icon: "Circle" },
  { key: "cricket", label: "Cricket", icon: "Target" },
  { key: "boat_race", label: "Boat racing", icon: "Ship" },
  { key: "athletics", label: "Athletics", icon: "Timer" },
  { key: "other", label: "Other sports", icon: "Medal" },
] as const;
export type SportKey = (typeof SPORTS)[number]["key"];

export const placeMeta = (k: string) => PLACE_CATEGORIES.find((c) => c.key === k) ?? PLACE_CATEGORIES[PLACE_CATEGORIES.length - 1];
export const eventMeta = (k: string) => EVENT_CATEGORIES.find((c) => c.key === k) ?? EVENT_CATEGORIES[EVENT_CATEGORIES.length - 1];
export const sportMeta = (k?: string | null) => SPORTS.find((s) => s.key === k) ?? SPORTS[SPORTS.length - 1];

export const EVENT_STATUSES = ["scheduled", "tbc", "cancelled"] as const;
