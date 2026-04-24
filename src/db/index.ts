import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import { type HealthcheckResult } from "../lib/health.js";
import { env } from "../env.js";

const client = postgres(env.DATABASE_URL, { connect_timeout: 3 });

export const db = drizzle(client);

export const healthCheck = async (): Promise<HealthcheckResult> => {
  const start = Date.now();

  try {
    await db.execute(sql`SELECT 1`);
    return { status: "ok", latencyMs: Date.now() - start };
  } catch (err) {
    return {
      status: "error",
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
};
