// Next.js instrumentation: startup log + central logging of server errors.
import { log } from "@/lib/logger";

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { logStartup } = await import("@/lib/startup");
  logStartup();
}

/** Called by Next.js for errors in Server Components, Route Handlers, Server Actions and Proxy. */
export function onRequestError(err, request, context) {
  const e = err instanceof Error ? err : new Error(String(err));
  log.child("http").error("request.error", {
    error: e,
    digest: err?.digest,
    method: request.method,
    path: request.path?.split("?")[0], // query strings can hold search terms
    route: context.routePath,
    routeType: context.routeType,
    renderSource: context.renderSource,
  });
}
