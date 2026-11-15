"use server";
import { refresh } from "next/cache";
import { and, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { activities, commentLikes, comments } from "@/db/schema";
import { ensureMedia } from "@/lib/media";
import { requireUser } from "@/lib/session";

const body = z.string().trim().min(1, "Comment can't be empty").max(5000);

const addInput = z.object({
  tmdbId: z.coerce.number().int().positive(),
  type: z.enum(["movie", "tv"]),
  season: z.coerce.number().int().min(0).default(0),
  episode: z.coerce.number().int().min(0).default(0),
  parentId: z.coerce.number().int().positive().optional(),
  body,
  spoiler: z.boolean().default(false),
});

/** Form action (useActionState): returns { error } or { ok }. */
export async function addComment(_prev, formData) {
  const user = await requireUser();
  const parsed = addInput.safeParse({
    tmdbId: formData.get("tmdbId"),
    type: formData.get("type"),
    season: formData.get("season") ?? 0,
    episode: formData.get("episode") ?? 0,
    parentId: formData.get("parentId") || undefined,
    body: formData.get("body"),
    spoiler: formData.get("spoiler") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { tmdbId, type, season, episode, parentId, body: text, spoiler } = parsed.data;
  const m = await ensureMedia(tmdbId, type);

  await db.transaction(async (tx) => {
    if (parentId) {
      // Replies must belong to the same thread target.
      const [parent] = await tx
        .select({ id: comments.id })
        .from(comments)
        .where(
          and(
            eq(comments.id, parentId),
            eq(comments.mediaId, m.id),
            eq(comments.season, season),
            eq(comments.episode, episode),
          ),
        );
      if (!parent) throw new Error("Parent comment not found");
    }
    const [c] = await tx
      .insert(comments)
      .values({ userId: user.id, mediaId: m.id, season, episode, parentId, body: text, spoiler })
      .returning({ id: comments.id });
    await tx.insert(activities).values({
      userId: user.id,
      type: "commented",
      mediaId: m.id,
      payload: { commentId: c.id, season, episode, excerpt: spoiler ? null : text.slice(0, 140) },
    });
  });
  refresh();
  return { ok: Date.now() };
}

export async function editComment({ id, body: text }) {
  const user = await requireUser();
  const parsedBody = body.parse(text);
  await db
    .update(comments)
    .set({ body: parsedBody, editedAt: sql`now()` })
    .where(and(eq(comments.id, id), eq(comments.userId, user.id), isNull(comments.deletedAt)));
  refresh();
}

/** Soft delete: keeps the row so replies stay attached. */
export async function deleteComment(id) {
  const user = await requireUser();
  await db
    .update(comments)
    .set({ deletedAt: sql`now()` })
    .where(and(eq(comments.id, z.number().int().parse(id)), eq(comments.userId, user.id)));
  refresh();
}

export async function toggleLike(commentId, liked) {
  const user = await requireUser();
  const cid = z.number().int().parse(commentId);
  if (liked) {
    await db.insert(commentLikes).values({ userId: user.id, commentId: cid }).onConflictDoNothing();
  } else {
    await db
      .delete(commentLikes)
      .where(and(eq(commentLikes.userId, user.id), eq(commentLikes.commentId, cid)));
  }
  refresh();
}
