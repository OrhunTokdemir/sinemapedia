import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";
import { createAuthMiddleware, getSessionFromCtx, isAPIError } from "better-auth/api";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { requireSecret } from "./secrets";
import { clientIp, log, maskIp } from "./logger";

const authLog = log.child("auth");

// Auth events for the security log: user id + masked IP; never passwords, emails or tokens.
const SIGN_IN = new Set(["/sign-in/email", "/sign-in/username"]);
const logAuthEvents = createAuthMiddleware(async (ctx) => {
  const { path } = ctx;
  if (!SIGN_IN.has(path) && path !== "/sign-up/email") return;
  const returned = ctx.context.returned;
  const failed = isAPIError(returned);
  const ip = maskIp(clientIp(ctx.headers));
  const userId = ctx.context.newSession?.user?.id ?? ctx.context.session?.user?.id;
  if (path === "/sign-up/email") {
    if (failed) authLog.warn("signup.failed", { ip, reason: returned.body?.code ?? returned.status });
    else authLog.info("signup.ok", { userId, ip });
  } else if (SIGN_IN.has(path)) {
    if (failed) {
      // Attempted username only (not the email form, which is personal data).
      authLog.warn("login.failed", { ip, username: ctx.body?.username, reason: returned.body?.code ?? returned.status });
    } else authLog.info("login.ok", { userId, ip });
  }
});

// Logged before the handler runs: afterwards the session (and its user id) is already gone.
const logSignOut = createAuthMiddleware(async (ctx) => {
  if (ctx.path !== "/sign-out") return;
  const session = await getSessionFromCtx(ctx).catch(() => null);
  authLog.info("logout", { userId: session?.user?.id, ip: maskIp(clientIp(ctx.headers)) });
});

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
    hooks: { before: logSignOut, after: logAuthEvents },
    // Route Better Auth's own messages through our logger.
    logger: {
      level: process.env.NODE_ENV === "production" ? "warn" : "info",
      log: (level, message, ...args) =>
        log.child("better-auth")[level === "success" ? "info" : level]?.(message, args.length ? { details: args } : undefined),
    },
    plugins: [username({ minUsernameLength: 3, maxUsernameLength: 30 }), nextCookies()],
  });
  return instance;
}
