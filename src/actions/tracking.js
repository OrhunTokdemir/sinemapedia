"use server";
import { refresh } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { activities, episodeWatches, userMediaStatus } from "@/db/schema";
import { ensureMedia } from "@/lib/media";
import { requireUser } from "@/lib/session";
import { log } from "@/lib/logger";

const actionLog = log.child("action");
import { getSeason } from "@/lib/tmdb";

const id = z.coerce.number().int().positive();
const num = z.coerce.number().int().min(0);

const statusInput = z.object({
  tmdbId: id,
  type: z.enum(["movie", "tv"]),
  status: z.enum(["plan_to_watch", "watching", "completed", "dropped"]).nullable(),
});

/** Set (or clear, with status=null) the viewer's status for a title. */
export async function setStatus(input) {
  const user = await requireUser();
  const { tmdbId, type, status } = statusInput.parse(input);
  const m = await ensureMedia(tmdbId, type);

  await db.transaction(async (tx) => {
    if (status === null) {
      await tx
        .delete(userMediaStatus)
        .where(and(eq(userMediaStatus.userId, user.id), eq(userMediaStatus.mediaId, m.id)));
      return;
    }
    await tx
      .insert(userMediaStatus)
      .values({ userId: user.id, mediaId: m.id, status })
      .onConflictDoUpdate({
        target: [userMediaStatus.userId, userMediaStatus.mediaId],
        set: { status, updatedAt: sql`now()` },
      });
    await tx.insert(activities).values({ userId: user.id, type: "status_changed", mediaId: m.id, payload: { status } });
  });
  actionLog.info("tracking.status", { userId: user.id, tmdbId, type, status });
  refresh();
}

const episodesInput = z.object({
  tmdbId: id,
  season: num,
  episodes: z.array(num).min(1).max(500),
  watched: z.boolean(),
});

async function writeEpisodes(user, { tmdbId, season, episodes, watched }) {
  const m = await ensureMedia(tmdbId, "tv");
  await db.transaction(async (tx) => {
    if (!watched) {
      for (const episode of episodes) {
        await tx
          .delete(episodeWatches)
          .where(
            and(
              eq(episodeWatches.userId, user.id),
              eq(episodeWatches.mediaId, m.id),
              eq(episodeWatches.season, season),
              eq(episodeWatches.episode, episode),
            ),
          );
      }
      return;
    }
    const inserted = await tx
      .insert(episodeWatches)
      .values(episodes.map((episode) => ({ userId: user.id, mediaId: m.id, season, episode })))
      .onConflictDoNothing()
      .returning({ episode: episodeWatches.episode });
    if (inserted.length === 0) return;

    // Watching an episode implies the show is being watched.
    await tx
      .insert(userMediaStatus)
      .values({ userId: user.id, mediaId: m.id, status: "watching" })
      .onConflictDoUpdate({
        target: [userMediaStatus.userId, userMediaStatus.mediaId],
        set: { updatedAt: sql`now()` },
      });
    await tx.insert(activities).values({
      userId: user.id,
      type: "watched_episode",
      mediaId: m.id,
      payload: inserted.length === 1 ? { season, episode: inserted[0].episode } : { season, count: inserted.length },
    });
  });
}

export async function toggleEpisode({ tmdbId, season, episode, watched }) {
  const user = await requireUser();
  await writeEpisodes(user, episodesInput.parse({ tmdbId, season, episodes: [episode], watched }));
  actionLog.info("episode.watched", { userId: user.id, tmdbId, season, episode, watched });
  refresh();
}

/** Mark every aired episode of a season watched/unwatched. */
export async function markSeason({ tmdbId, season, watched }) {
  const user = await requireUser();
  const s = await getSeason(id.parse(tmdbId), num.parse(season));
  const today = new Date().toISOString().slice(0, 10);
  const episodes = (s?.episodes ?? [])
    .filter((e) => !watched || (e.air_date && e.air_date <= today))
    .map((e) => e.episode_number);
  if (episodes.length === 0) return;
  await writeEpisodes(user, episodesInput.parse({ tmdbId, season, episodes, watched }));
  actionLog.info("season.watched", { userId: user.id, tmdbId, season, episodes: episodes.length, watched });
  refresh();
}
