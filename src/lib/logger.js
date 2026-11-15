// Small structured logger (no dependencies).
// Production: one JSON object per line on stdout/stderr (Docker collects it).
// Development: short colored lines. Level from LOG_LEVEL (debug | info | warn | error; default info).
//
// Never pass passwords, tokens, cookies, emails or free text written by users.
// Keys that look sensitive are redacted anyway as a safety net.

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const isProd = process.env.NODE_ENV === "production";
const minLevel = LEVELS[process.env.LOG_LEVEL?.toLowerCase()] ?? LEVELS.info;
const SENSITIVE = /pass(word)?|token|secret|cookie|authorization|email|session/i;
const COLORS = { debug: "\x1b[90m", info: "\x1b[36m", warn: "\x1b[33m", error: "\x1b[31m" };

function redact(value, depth = 0) {
  if (value instanceof Error) {
    return { name: value.name, message: value.message, ...(isProd ? {} : { stack: value.stack }) };
  }
  if (!value || typeof value !== "object" || depth > 3) return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    if (v === undefined) continue;
    out[k] = SENSITIVE.test(k) && k !== "sessionId" ? "[redacted]" : redact(v, depth + 1);
  }
  return out;
}

function write(level, scope, event, fields) {
  if (LEVELS[level] < minLevel) return;
  const data = redact(fields ?? {});
  const stream = LEVELS[level] >= LEVELS.warn ? console.error : console.log;
  if (isProd) {
    stream(JSON.stringify({ t: new Date().toISOString(), level, scope, event, ...data }));
    return;
  }
  const time = new Date().toTimeString().slice(0, 8);
  const pairs = Object.entries(data)
    .map(([k, v]) => `${k}=${typeof v === "string" ? v : JSON.stringify(v)}`)
    .join(" ");
  stream(`${COLORS[level]}${time} ${level.toUpperCase().padEnd(5)}\x1b[0m ${scope ? `[${scope}] ` : ""}${event}${pairs ? ` ${pairs}` : ""}`);
}

function make(scope) {
  return {
    debug: (event, fields) => write("debug", scope, event, fields),
    info: (event, fields) => write("info", scope, event, fields),
    warn: (event, fields) => write("warn", scope, event, fields),
    error: (event, fields) => write("error", scope, event, fields),
    child: (sub) => make(scope ? `${scope}.${sub}` : sub),
  };
}

export const log = make("");

/** Truncates an IP for logs: IPv4 → a.b.c.0 (/24), IPv6 → first 3 groups (/48). */
export function maskIp(ip) {
  if (!ip) return undefined;
  const v4 = ip.replace(/^::ffff:/i, "");
  if (/^\d+\.\d+\.\d+\.\d+$/.test(v4)) return v4.replace(/\.\d+$/, ".0");
  if (!ip.includes(":")) return undefined;
  // Expand "::" so the first three groups are real groups (e.g. "::1" → 0:0:0).
  const [head, tail = ""] = ip.split("%")[0].split("::");
  const h = head ? head.split(":") : [];
  const t = tail ? tail.split(":") : [];
  const groups = ip.includes("::") ? [...h, ...Array(8 - h.length - t.length).fill("0"), ...t] : h;
  return `${groups.slice(0, 3).map((g) => g.replace(/^0+(?=.)/, "")).join(":")}::/48`;
}

/** Client IP from proxy headers (Caddy sets X-Forwarded-For). Accepts a Headers object. */
export function clientIp(headers) {
  const fwd = headers?.get?.("x-forwarded-for");
  return (fwd ? fwd.split(",")[0].trim() : headers?.get?.("x-real-ip")) || undefined;
}
