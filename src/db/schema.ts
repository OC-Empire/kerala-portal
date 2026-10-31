import { pgTable, text, serial, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";

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
