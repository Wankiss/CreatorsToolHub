import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Keep ≥1 connection open so requests after an idle period don't pay the
  // full TCP + TLS + Postgres-auth cold-start cost (~100–300 ms on Replit).
  min: 1,
  max: 10,
  // TCP keepalive prevents idle connections from being silently dropped by
  // Replit's network layer or the Postgres server's own idle timeout.
  keepAlive: true,
  keepAliveInitialDelayMillis: 0,
  // Fail fast on pool exhaustion rather than hanging the request indefinitely.
  connectionTimeoutMillis: 5000,
  // Release truly idle connections after 30 s (but min:1 ensures one survives).
  idleTimeoutMillis: 30000,
});
export const db = drizzle(pool, { schema });

export * from "./schema";
