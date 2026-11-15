import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import { getMovie, getShow, yearOf } from "./tmdb";

/** Find the local media row for a TMDB title, or null. */
export async function findMedia(tmdbId, type) {
  const [row] = await db
    .select()
    .from(media)
    .where(and(eq(media.tmdbId, tmdbId), eq(media.type, type)))
    .limit(1);
  return row ?? null;
}

/** Upsert a local copy of a TMDB title's display fields; returns the row. */
export async function ensureMedia(tmdbId, type) {
  const data = type === "movie" ? await getMovie(tmdbId) : await getShow(tmdbId);
  if (!data) throw new Error("Title not found on TMDB");
  const values = {
    tmdbId,
    type,
    title: data.title ?? data.name,
    posterPath: data.poster_path,
    year: yearOf(data.release_date ?? data.first_air_date),
  };
  const [row] = await db
    .insert(media)
    .values(values)
    .onConflictDoUpdate({
      target: [media.tmdbId, media.type],
      set: { title: values.title, posterPath: values.posterPath, year: values.year, updatedAt: sql`now()` },
    })
    .returning();
  return row;
}
