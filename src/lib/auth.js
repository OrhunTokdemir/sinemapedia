import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { requireSecret } from "./secrets";

let instance;

/**
 * Better Auth is created lazily on first use, so `next build` (which imports route
 * modules) never initializes it without secrets. At runtime a missing secret or
 * base URL throws instead of silently falling back to Better Auth's default key.
 */
export function getAuth() {
  if (instance) return instance;
  const baseURL = requireSecret("BETTER_AUTH_URL");
  instance = betterAuth({
    secret: requireSecret("BETTER_AUTH_SECRET"),
    baseURL,
    trustedOrigins: [baseURL],
    database: drizzleAdapter(db, { provider: "pg", schema, transaction: true }),
    emailAndPassword: { enabled: true, minPasswordLength: 8 },
    user: {
      additionalFields: {
        bio: { type: "string", required: false, input: true },
      },
    },
    rateLimit: { enabled: true, window: 60, max: 30 },
    plugins: [username({ minUsernameLength: 3, maxUsernameLength: 30 }), nextCookies()],
  });
  return instance;
}
