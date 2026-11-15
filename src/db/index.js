import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { databaseUrl } from "@/lib/secrets";

const globalForDb = globalThis;

// Reuse the pool across hot reloads in development.
const pool =
  globalForDb.__pgPool ??
  new Pool({ connectionString: databaseUrl(), max: 10 });
if (process.env.NODE_ENV !== "production") globalForDb.__pgPool = pool;

export const db = drizzle(pool, { schema, casing: "snake_case" });
