// Applies SQL migrations from ./drizzle and reports the result clearly.
// (drizzle-kit migrate swallows database errors, which hides real problems.)
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import { databaseUrl } from "../src/lib/secrets.js";

// Locally, pick up DB settings from .env; in Docker they come from the environment.
try {
  process.loadEnvFile(".env");
} catch {}

const url = databaseUrl();
if (!url) {
  console.error("✗ No database configured. Set DATABASE_URL, or DB_HOST + DB_PASSWORD_FILE.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: url, max: 1 });
try {
  await migrate(drizzle(pool), {
    migrationsFolder: "./drizzle",
    migrationsSchema: "public",
    migrationsTable: "__drizzle_migrations",
  });
  const { rows } = await pool.query("select count(*)::int as n from public.__drizzle_migrations");
  console.log(`✓ Migrations up to date (${rows[0].n} applied).`);
} catch (err) {
  console.error("✗ Migration failed:", err.message);
  if (err.code) console.error(`  Postgres error code: ${err.code}`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
