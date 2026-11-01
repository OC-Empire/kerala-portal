import { pgTable, text, serial, integer, timestamp, jsonb, boolean, doublePrecision } from "drizzle-orm/pg-core";

export const districtsTable = pgTable("districts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  malayalamName: text("malayalam_name").notNull(),
  slug: text("slug").notNull().unique(),
  capital: text("capital").notNull(),
  region: text("region").notNull(), // "north" | "central" | "south"
  color: text("color").notNull(),
  accentBg: text("accent_bg").notNull(),
  population: text("population").notNull(),
  area: text("area").notNull(),
  famousFor: jsonb("famous_for").$type<string[]>().notNull(),
  touristSpots: jsonb("tourist_spots").$type<{ name: string; description: string; emoji: string }[]>().notNull(),
  signatureFood: jsonb("signature_food").$type<string[]>().notNull(),
  culturalIcons: jsonb("cultural_icons").$type<string[]>().notNull(),
  lat: text("lat").notNull(),
  lng: text("lng").notNull(),
  tagline: text("tagline").notNull(),
});

export const subLocationsTable = pgTable("sub_locations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  malayalamName: text("malayalam_name").notNull(),
  districtSlug: text("district_slug").notNull().references(() => districtsTable.slug),
  type: text("type").notNull(), // "it_hub" | "heritage" | "coastal" | "hill_station" | "commercial" | "pilgrimage"
  tagline: text("tagline").notNull(),
  highlights: jsonb("highlights").$type<string[]>().notNull(),
  activeIssuesCount: integer("active_issues_count").default(0),
});

export const newsTable = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  category: text("category").notNull(),
  district: text("district").notNull(),
  subLocation: text("sub_location"),
  source: text("source").notNull(),
  url: text("url").default("#"),
  imageUrl: text("image_url"),
  isBreaking: boolean("is_breaking").default(false),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
});

export const civicIssuesTable = pgTable("civic_issues", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  district: text("district").notNull(),
  subLocation: text("sub_location").notNull(),
  category: text("category").notNull(), // "roads" | "water" | "electricity" | "sanitation" | "safety" | "other"
  status: text("status").notNull().default("open"), // "open" | "in-progress" | "resolved"
  upvotes: integer("upvotes").notNull().default(1),
  reportedBy: text("reported_by").default("Anonymous Citizen"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type DistrictRow = typeof districtsTable.$inferSelect;
export type SubLocationRow = typeof subLocationsTable.$inferSelect;
export type NewsRow = typeof newsTable.$inferSelect;
export type CivicIssueRow = typeof civicIssuesTable.$inferSelect;

// ---- Places & events (curated; imported from CSV via scripts/import-data.mjs) ----
export const placesTable = pgTable("places", {
  id: text("id").primaryKey(),
  districtSlug: text("district_slug").notNull(),
  category: text("category").notNull(), // see src/lib/places.ts PLACE_CATEGORIES
  name: text("name").notNull(),
  malayalamName: text("malayalam_name"),
  description: text("description"),
  address: text("address"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  phone: text("phone"),
  website: text("website"),
  hours: text("hours"),
  fee: text("fee"),
  imageUrl: text("image_url"),
  sourceUrl: text("source_url"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const eventsTable = pgTable("events", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  malayalamTitle: text("malayalam_title"),
  category: text("category").notNull(), // see src/lib/places.ts EVENT_CATEGORIES
  sport: text("sport"), // for category=sports
  districtSlug: text("district_slug"), // null = statewide
  venue: text("venue"),
  description: text("description"),
  startsAt: timestamp("starts_at", { withTimezone: true }), // null = date not fixed yet
  endsAt: timestamp("ends_at", { withTimezone: true }),
  dateNote: text("date_note"), // e.g. "Typically held in August"
  status: text("status").notNull().default("scheduled"), // scheduled | tbc | cancelled
  website: text("website"),
  imageUrl: text("image_url"),
  sourceUrl: text("source_url"),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PlaceRow = typeof placesTable.$inferSelect;
export type EventRow = typeof eventsTable.$inferSelect;
