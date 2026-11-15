import "server-only";
import { and, avg, count, desc, eq, inArray, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  activities,
  commentLikes,
  comments,
  episodeWatches,
  follows,
  media,
  ratings,
  user,
  userMediaStatus,
} from "@/db/schema";
import { findMedia } from "./media";

const publicUser = {
  id: user.id,
  name: user.name,
  username: user.username,
  image: user.image,
};

/** Viewer's status + rating for a title (or episode), and the community average. */
export async function getTitleState({ tmdbId, type, season = 0, episode = 0, userId }) {
  const m = await findMedia(tmdbId, type);
  if (!m) return { status: null, myScore: null, avgScore: null, ratingCount: 0 };

  const target = and(eq(ratings.mediaId, m.id), eq(ratings.season, season), eq(ratings.episode, episode));
  const [[agg], mine, st] = await Promise.all([
    db.select({ avg: avg(ratings.score), n: count() }).from(ratings).where(target),
    userId
      ? db.select({ score: ratings.score }).from(ratings).where(and(target, eq(ratings.userId, userId)))
      : [],
    userId && season === 0
      ? db
          .select({ status: userMediaStatus.status })
          .from(userMediaStatus)
          .where(and(eq(userMediaStatus.mediaId, m.id), eq(userMediaStatus.userId, userId)))
      : [],
  ]);
  return {
    status: st[0]?.status ?? null,
    myScore: mine[0]?.score ?? null,
    avgScore: agg?.avg ? Number(agg.avg) : null,
    ratingCount: Number(agg?.n ?? 0),
  };
}

/**
 * Sinemapedia averages for a batch of TMDB items (one query), keyed "type-tmdbId".
 * Only titles with at least one whole-title rating are included.
 */
export async function getCommunityScores(items, fallbackType) {
  const keys = items
    .map((i) => ({ tmdbId: i.id, type: i.media_type ?? fallbackType }))
    .filter((k) => k.type === "movie" || k.type === "tv");
  if (keys.length === 0) return new Map();

  const rows = await db
    .select({ tmdbId: media.tmdbId, type: media.type, avg: avg(ratings.score), n: count() })
    .from(ratings)
    .innerJoin(media, eq(media.id, ratings.mediaId))
    .where(
      and(
        eq(ratings.season, 0),
        eq(ratings.episode, 0),
        inArray(
          sql`(${media.type}::text || '-' || ${media.tmdbId})`,
          keys.map((k) => `${k.type}-${k.tmdbId}`),
        ),
      ),
    )
    .groupBy(media.tmdbId, media.type);

  return new Map(rows.map((r) => [`${r.type}-${r.tmdbId}`, { avg: Number(r.avg), n: Number(r.n) }]));
}

/** Comments for a title/episode, oldest first, with author, like count and whether the viewer liked it. */
export async function getComments({ tmdbId, type, season = 0, episode = 0, viewerId }) {
  const m = await findMedia(tmdbId, type);
  if (!m) return [];
  const rows = await db
    .select({
      id: comments.id,
      parentId: comments.parentId,
      body: comments.body,
      spoiler: comments.spoiler,
      createdAt: comments.createdAt,
      editedAt: comments.editedAt,
      deletedAt: comments.deletedAt,
      author: publicUser,
      likes: sql`(select count(*)::int from ${commentLikes} where ${commentLikes.commentId} = ${comments.id})`,
      liked: viewerId
        ? sql`exists(select 1 from ${commentLikes} where ${commentLikes.commentId} = ${comments.id} and ${commentLikes.userId} = ${viewerId})`
        : sql`false`,
    })
    .from(comments)
    .innerJoin(user, eq(user.id, comments.userId))
    .where(and(eq(comments.mediaId, m.id), eq(comments.season, season), eq(comments.episode, episode)))
    .orderBy(comments.createdAt);
  return rows.map((c) => (c.deletedAt ? { ...c, body: null } : c));
}

/** Set of "season:episode" keys the user has watched for a show. */
export async function getWatchedSet(userId, tmdbId) {
  if (!userId) return new Set();
  const m = await findMedia(tmdbId, "tv");
  if (!m) return new Set();
  const rows = await db
    .select({ s: episodeWatches.season, e: episodeWatches.episode })
    .from(episodeWatches)
    .where(and(eq(episodeWatches.userId, userId), eq(episodeWatches.mediaId, m.id)));
  return new Set(rows.map((r) => `${r.s}:${r.e}`));
}

/** All titles the user tracks, with watched-episode counts and the latest watched episode for shows. */
export async function getTracking(userId) {
  return db
    .select({
      status: userMediaStatus.status,
      updatedAt: userMediaStatus.updatedAt,
      media,
      watchedCount: sql`(select count(*)::int from ${episodeWatches} where ${episodeWatches.userId} = ${userId} and ${episodeWatches.mediaId} = ${media.id})`,
      last: sql`(select json_build_object('season', ${episodeWatches.season}, 'episode', ${episodeWatches.episode})
                from ${episodeWatches} where ${episodeWatches.userId} = ${userId} and ${episodeWatches.mediaId} = ${media.id}
                order by ${episodeWatches.season} desc, ${episodeWatches.episode} desc limit 1)`,
    })
    .from(userMediaStatus)
    .innerJoin(media, eq(media.id, userMediaStatus.mediaId))
    .where(eq(userMediaStatus.userId, userId))
    .orderBy(desc(userMediaStatus.updatedAt));
}

export async function getUserByUsername(username) {
  const [row] = await db
    .select({ ...publicUser, bio: user.bio, createdAt: user.createdAt })
    .from(user)
    .where(eq(user.username, username.toLowerCase()))
    .limit(1);
  return row ?? null;
}

export async function getFollowStats(userId, viewerId) {
  const [[a], [b], f] = await Promise.all([
    db.select({ n: count() }).from(follows).where(eq(follows.followingId, userId)),
    db.select({ n: count() }).from(follows).where(eq(follows.followerId, userId)),
    viewerId && viewerId !== userId
      ? db
          .select({ x: follows.followerId })
          .from(follows)
          .where(and(eq(follows.followerId, viewerId), eq(follows.followingId, userId)))
      : [],
  ]);
  return { followers: Number(a.n), following: Number(b.n), isFollowing: f.length > 0 };
}

export async function getFollowList(userId, direction) {
  const joinCol = direction === "followers" ? follows.followerId : follows.followingId;
  const whereCol = direction === "followers" ? follows.followingId : follows.followerId;
  return db
    .select(publicUser)
    .from(follows)
    .innerJoin(user, eq(user.id, joinCol))
    .where(eq(whereCol, userId))
    .orderBy(desc(follows.createdAt));
}

export async function getUserRatings(userId, limit = 24) {
  return db
    .select({ score: ratings.score, season: ratings.season, episode: ratings.episode, media })
    .from(ratings)
    .innerJoin(media, eq(media.id, ratings.mediaId))
    .where(and(eq(ratings.userId, userId), eq(ratings.season, 0)))
    .orderBy(desc(ratings.updatedAt))
    .limit(limit);
}

const activitySelect = {
  id: activities.id,
  type: activities.type,
  payload: activities.payload,
  createdAt: activities.createdAt,
  actor: publicUser,
  media: { tmdbId: media.tmdbId, type: media.type, title: media.title, posterPath: media.posterPath },
};

/** Activities by the given user ids, newest first, cursor = last seen activity id. */
async function activitiesFor(userIdsQuery, { cursor, limit = 30 } = {}) {
  return db
    .select(activitySelect)
    .from(activities)
    .innerJoin(user, eq(user.id, activities.userId))
    .leftJoin(media, eq(media.id, activities.mediaId))
    .where(and(userIdsQuery, cursor ? lt(activities.id, cursor) : undefined))
    .orderBy(desc(activities.id))
    .limit(limit);
}

export function getUserActivity(userId, opts) {
  return activitiesFor(eq(activities.userId, userId), opts);
}

export function getFeed(viewerId, opts) {
  const followed = db
    .select({ id: follows.followingId })
    .from(follows)
    .where(eq(follows.followerId, viewerId));
  return activitiesFor(inArray(activities.userId, followed), opts);
}
