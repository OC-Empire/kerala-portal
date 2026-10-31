import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }
  if (!dbInstance) {
    const client = neon(connectionString);
    dbInstance = drizzle(client, { schema });
  }
  return dbInstance;
}

export { schema };
