// Node-only startup log (loaded from instrumentation.js when NEXT_RUNTIME === "nodejs").
import { databaseUrl, readSecret } from "./secrets";
import { log } from "./logger";

const CONFIG = ["BETTER_AUTH_URL", "BETTER_AUTH_SECRET", "TMDB_READ_TOKEN", "KVKK_CONTACT_EMAIL"];

/** Logs version, environment and which settings are present ("set"/"missing"), never their values. */
export function logStartup() {
  const present = (fn) => {
    try {
      return fn() ? "set" : "missing";
    } catch {
      return "unreadable"; // e.g. *_FILE points to a missing file
    }
  };
  // Names go in arrays (values, not keys) so the logger's key-based redaction leaves them readable.
  const status = { database: present(databaseUrl) };
  for (const name of CONFIG) status[name] = present(() => readSecret(name));
  const by = (state) => Object.keys(status).filter((k) => status[k] === state);
  log.child("app").info("startup", {
    version: process.env.npm_package_version,
    env: process.env.NODE_ENV,
    node: process.version,
    logLevel: process.env.LOG_LEVEL || "default",
    configPresent: by("set"),
    configMissing: by("missing"),
    configUnreadable: by("unreadable"),
  });
}
