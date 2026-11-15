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
  strict: true,
  verbose: true,
});
