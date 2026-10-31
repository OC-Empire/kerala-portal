import { neon } from "@neondatabase/serverless";

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return null;
  }
  return neon(databaseUrl);
}

// In-memory fallback if Neon DATABASE_URL is not set or while booting
export const fallbackStore = {
  issues: [
    {
      id: "iss-1",
      title: "NH-66 Service Road Flooding & Potholes",
      description: "Severe waterlogging near Kazhakootam junction after rains. Commuters & Technopark buses facing 40-min gridlocks.",
      district: "thiruvananthapuram",
      subLocation: "Kazhakootam / Technopark",
      category: "roads",
      status: "in-progress",
      upvotes: 142,
      createdAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
    },
    {
      id: "iss-2",
      title: "Drinking Water Pipeline Outage in Attipra Ward",
      description: "No municipal water supply for the past 48 hours. Tankers unable to enter narrow lanes.",
      district: "thiruvananthapuram",
      subLocation: "Attipra / Kulathoor",
      category: "water",
      status: "open",
      upvotes: 98,
      createdAt: new Date(Date.now() - 6 * 3600_000).toISOString(),
    },
    {
      id: "iss-3",
      title: "Fort Kochi Heritage Walkway Streetlight Maintenance",
      description: "Dark stretch between beach walkway and Santa Cruz Basilica. Needs solar lights.",
      district: "ernakulam",
      subLocation: "Fort Kochi",
      category: "electricity",
      status: "resolved",
      upvotes: 76,
      createdAt: new Date(Date.now() - 24 * 3600_000).toISOString(),
    },
    {
      id: "iss-4",
      title: "Vembanad Lake Plastic Cleanup Required",
      description: "Houseboat jetty accumulation of non-biodegradable waste near Punnamada finish point.",
      district: "alappuzha",
      subLocation: "Punnamada / Kuttanad",
      category: "sanitation",
      status: "open",
      upvotes: 115,
      createdAt: new Date(Date.now() - 12 * 3600_000).toISOString(),
    },
    {
      id: "iss-5",
      title: "Munnar Ghat Road Landslide Warning Sensors",
      description: "Request to install early sensor monitors near Gap Road curve ahead of monsoon.",
      district: "idukki",
      subLocation: "Munnar Gap Road",
      category: "safety",
      status: "in-progress",
      upvotes: 210,
      createdAt: new Date(Date.now() - 48 * 3600_000).toISOString(),
    },
  ],
};
