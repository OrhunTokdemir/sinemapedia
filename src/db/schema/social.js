import { pgTable, pgEnum, text, integer, boolean, timestamp, serial, jsonb, primaryKey, index, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./auth";
import { media } from "./media";

export const comments = pgTable(
  "comments",
  {
    id: serial().primaryKey(),
    userId: text().notNull().references(() => user.id, { onDelete: "cascade" }),
    mediaId: integer().notNull().references(() => media.id, { onDelete: "cascade" }),
    season: integer().notNull().default(0),
    episode: integer().notNull().default(0),
    parentId: integer().references(() => comments.id, { onDelete: "cascade" }),
    body: text().notNull(),
    spoiler: boolean().notNull().default(false),
    createdAt: timestamp().notNull().defaultNow(),
    editedAt: timestamp(),
    deletedAt: timestamp(),
  },
  (t) => [index().on(t.mediaId, t.season, t.episode, t.createdAt)],
);

export const commentLikes = pgTable(
  "comment_likes",
  {
    userId: text().notNull().references(() => user.id, { onDelete: "cascade" }),
    commentId: integer().notNull().references(() => comments.id, { onDelete: "cascade" }),
    createdAt: timestamp().notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.commentId] })],
);

export const follows = pgTable(
  "follows",
  {
    followerId: text().notNull().references(() => user.id, { onDelete: "cascade" }),
    followingId: text().notNull().references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp().notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.followerId, t.followingId] }),
    index().on(t.followingId),
    check("no_self_follow", sql`${t.followerId} <> ${t.followingId}`),
  ],
);

export const activityType = pgEnum("activity_type", [
  "rated",
  "commented",
  "watched_episode",
  "status_changed",
  "followed",
]);

export const activities = pgTable(
  "activities",
  {
    id: serial().primaryKey(),
    userId: text().notNull().references(() => user.id, { onDelete: "cascade" }),
    type: activityType().notNull(),
    mediaId: integer().references(() => media.id, { onDelete: "cascade" }),
    payload: jsonb().notNull().default({}),
    createdAt: timestamp().notNull().defaultNow(),
  },
  (t) => [index().on(t.userId, t.createdAt.desc())],
);
