import { defineConfig } from "drizzle-kit";
import { databaseUrl } from "./src/lib/secrets.js";

// Locally, pick up DATABASE_URL from .env (in Docker it comes from the environment).
try {
  process.loadEnvFile(".env");
} catch {}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.js",
  out: "./drizzle",
  dbCredentials: { url: databaseUrl() },
  casing: "snake_case",
  // Keep the migrations journal in `public`: the app role may create tables there,
  // but deliberately has no CREATE privilege on the database (so no new schemas).
  migrations: { schema: "public", table: "__drizzle_migrations" },
  strict: true,
  verbose: true,
});
