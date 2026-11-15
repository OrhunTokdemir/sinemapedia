// Reads config secrets using the Docker `NAME_FILE` convention:
// if NAME_FILE is set (e.g. /run/secrets/x), the value is read from that file; otherwise NAME is used.
// Plain module (no "server-only") so drizzle.config.js can import it. Never import from client code.
import { readFileSync } from "node:fs";

export function readSecret(name) {
  const file = process.env[`${name}_FILE`];
  if (file) return readFileSync(file, "utf8").trim();
  return process.env[name]?.trim() || undefined;
}

export function requireSecret(name) {
  const value = readSecret(name);
  if (!value) throw new Error(`Missing secret ${name} (set ${name} or ${name}_FILE)`);
  return value;
}

/** DATABASE_URL in dev; in Docker, assembled from DB_* vars and the DB_PASSWORD secret file. */
export function databaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const password = readSecret("DB_PASSWORD");
  if (!password || !process.env.DB_HOST) return undefined;
  const user = encodeURIComponent(process.env.DB_USER ?? "sinemapedia");
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT ?? "5432";
  const name = process.env.DB_NAME ?? "sinemapedia";
  return `postgres://${user}:${encodeURIComponent(password)}@${host}:${port}/${name}`;
}
