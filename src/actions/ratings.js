"use server";
import { refresh } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { activities, ratings } from "@/db/schema";
import { ensureMedia } from "@/lib/media";
import { requireUser } from "@/lib/session";

const input = z.object({
  tmdbId: z.coerce.number().int().positive(),
  type: z.enum(["movie", "tv"]),
  season: z.coerce.number().int().min(0).default(0),
  episode: z.coerce.number().int().min(0).default(0),
  score: z.coerce.number().int().min(1).max(10).nullable(),
});

/** Rate a title/episode 1–10, or remove the rating with score=null. */
export async function rate(raw) {
  const user = await requireUser();
  const { tmdbId, type, season, episode, score } = input.parse(raw);
  const m = await ensureMedia(tmdbId, type);
  const target = { userId: user.id, mediaId: m.id, season, episode };

  await db.transaction(async (tx) => {
    if (score === null) {
      await tx
        .delete(ratings)
        .where(
          and(
            eq(ratings.userId, user.id),
            eq(ratings.mediaId, m.id),
            eq(ratings.season, season),
            eq(ratings.episode, episode),
          ),
        );
      return;
    }
    await tx
      .insert(ratings)
      .values({ ...target, score })
      .onConflictDoUpdate({
        target: [ratings.userId, ratings.mediaId, ratings.season, ratings.episode],
        set: { score, updatedAt: sql`now()` },
      });
    await tx.insert(activities).values({
      userId: user.id,
      type: "rated",
      mediaId: m.id,
      payload: { score, season, episode },
    });
  });
  refresh();
}
