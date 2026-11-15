import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { requireSecret } from "./secrets";
import { log } from "./logger";

const tmdbLog = log.child("tmdb");
const TIMEOUT_MS = 10_000;
const SLOW_MS = 2_000;

const BASE = "https://api.themoviedb.org/3";

async function tmdb(path, params = {}) {
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }
  // Only called inside 'use cache' functions, so this runs (and logs) on cache misses only.
  const started = performance.now();
  let res;
  try {
    res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${requireSecret("TMDB_READ_TOKEN")}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    const timedOut = err?.name === "TimeoutError";
    tmdbLog.error(timedOut ? "tmdb.timeout" : "tmdb.network_error", { path, error: timedOut ? undefined : err });
    throw new Error(timedOut ? `TMDB timeout for ${path}` : `TMDB request failed for ${path}`, { cause: err });
  }
  const durationMs = Math.round(performance.now() - started);
  if (res.status === 404) {
    tmdbLog.debug("tmdb.not_found", { path, durationMs });
    return null;
  }
  if (!res.ok) {
    const fields = { path, status: res.status, durationMs, retryAfter: res.headers.get("retry-after") ?? undefined };
    if (res.status === 429) tmdbLog.warn("tmdb.rate_limited", fields);
    else tmdbLog.error("tmdb.error", fields);
    throw new Error(`TMDB ${res.status} for ${path}`);
  }
  if (durationMs > SLOW_MS) tmdbLog.warn("tmdb.slow", { path, durationMs });
  else tmdbLog.debug("tmdb.ok", { path, durationMs });
  return res.json();
}

export function img(path, size = "w342") {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}

export function yearOf(date) {
  return date ? Number(date.slice(0, 4)) : null;
}

export async function getTrending(type = "all") {
  "use cache";
  cacheLife("hours");
  cacheTag("tmdb:trending");
  const data = await tmdb(`/trending/${type}/week`);
  return data?.results ?? [];
}

export async function getPopular(type) {
  "use cache";
  cacheLife("hours");
  cacheTag(`tmdb:popular:${type}`);
  const data = await tmdb(`/${type}/popular`);
  return data?.results ?? [];
}

/**
 * Most anticipated upcoming titles: release/first-air date within ~6 months of `fromDate`
 * (YYYY-MM-DD, passed in so the cache key rolls over daily), sorted by popularity.
 */
export async function getUpcoming(type, fromDate) {
  "use cache";
  cacheLife("hours");
  cacheTag(`tmdb:upcoming:${type}`);
  const to = new Date(`${fromDate}T00:00:00Z`);
  to.setUTCMonth(to.getUTCMonth() + 6);
  const until = to.toISOString().slice(0, 10);
  const dateKey = type === "movie" ? "primary_release_date" : "first_air_date";
  const data = await tmdb(`/discover/${type}`, {
    sort_by: "popularity.desc",
    include_adult: false,
    [`${dateKey}.gte`]: fromDate,
    [`${dateKey}.lte`]: until,
  });
  return data?.results ?? [];
}

/** Genre id → name map for "movie" or "tv". */
export async function getGenres(type) {
  "use cache";
  cacheLife("days");
  cacheTag(`tmdb:genres:${type}`);
  const data = await tmdb(`/genre/${type}/list`);
  return Object.fromEntries((data?.genres ?? []).map((g) => [g.id, g.name]));
}

export async function search(query, page = 1) {
  "use cache";
  cacheLife("minutes");
  if (!query?.trim()) return { results: [], total_pages: 0 };
  return tmdb("/search/multi", { query, page, include_adult: false });
}

export async function getMovie(id) {
  "use cache";
  cacheLife("days");
  cacheTag(`tmdb:movie:${id}`);
  return tmdb(`/movie/${id}`, { append_to_response: "credits,videos,recommendations,external_ids" });
}

export async function getShow(id) {
  "use cache";
  cacheLife("days");
  cacheTag(`tmdb:tv:${id}`);
  return tmdb(`/tv/${id}`, { append_to_response: "credits,videos,recommendations,external_ids" });
}

export async function getSeason(id, season) {
  "use cache";
  cacheLife("days");
  cacheTag(`tmdb:tv:${id}`);
  return tmdb(`/tv/${id}/season/${season}`);
}

export async function getEpisode(id, season, episode) {
  "use cache";
  cacheLife("days");
  cacheTag(`tmdb:tv:${id}`);
  return tmdb(`/tv/${id}/season/${season}/episode/${episode}`, { append_to_response: "credits" });
}

export async function getPerson(id) {
  "use cache";
  cacheLife("days");
  cacheTag(`tmdb:person:${id}`);
  return tmdb(`/person/${id}`, { append_to_response: "combined_credits" });
}
