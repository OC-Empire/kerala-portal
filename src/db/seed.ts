import { getDb } from "./index";
import { districtsTable, subLocationsTable, newsTable, civicIssuesTable } from "./schema";
import { DISTRICTS, ALL_SUB_LOCATIONS } from "@/lib/districts";
import { MOCK_NEWS } from "@/lib/news";
import { fallbackStore } from "@/lib/db";

async function main() {
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL not set");

  // Districts
  await db.insert(districtsTable).values(
    DISTRICTS.map((d) => ({
      id: d.id,
      name: d.name,
      malayalamName: d.malayalamName,
      slug: d.slug,
      capital: d.capital,
      region: d.region,
      color: d.color,
      accentBg: d.accentBg,
      population: d.population,
      area: d.area,
      famousFor: d.famousFor,
      touristSpots: d.touristSpots,
      signatureFood: d.signatureFood,
      culturalIcons: d.culturalIcons,
      lat: String(d.coordinates.lat),
      lng: String(d.coordinates.lng),
      tagline: d.tagline,
    }))
  ).onConflictDoNothing();

  // Sub-locations
  await db.insert(subLocationsTable).values(
    ALL_SUB_LOCATIONS.map((s) => ({
      id: s.id,
      name: s.name,
      malayalamName: s.malayalamName,
      districtSlug: s.districtSlug,
      type: s.type,
      tagline: s.tagline,
      highlights: s.highlights,
      activeIssuesCount: s.activeIssuesCount ?? 0,
    }))
  ).onConflictDoNothing();

  // News
  await db.insert(newsTable).values(
    MOCK_NEWS.map((n) => ({
      title: n.title,
      summary: n.summary,
      category: n.category,
      district: n.district,
      subLocation: null,
      source: n.source,
      url: n.url,
      imageUrl: n.imageUrl ?? null,
      isBreaking: n.isBreaking ?? false,
      publishedAt: n.publishedAt,
    }))
  );

  // Civic issues
  await db.insert(civicIssuesTable).values(
    fallbackStore.issues.map((i) => ({
      id: i.id,
      title: i.title,
      description: i.description,
      district: i.district,
      subLocation: i.subLocation,
      category: i.category,
      status: i.status,
      upvotes: i.upvotes,
      reportedBy: "Anonymous Citizen",
      createdAt: new Date(i.createdAt),
    }))
  ).onConflictDoNothing();

  console.log("Seed complete.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});