import { pgTable, pgEnum, text, integer, timestamp, primaryKey, uniqueIndex, index, check, serial } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./auth";
import { media } from "./media";

export const watchStatus = pgEnum("watch_status", ["plan_to_watch", "watching", "completed", "dropped"]);

export const userMediaStatus = pgTable(
  "user_media_status",
  {
    userId: text().notNull().references(() => user.id, { onDelete: "cascade" }),
    mediaId: integer().notNull().references(() => media.id, { onDelete: "cascade" }),
    status: watchStatus().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.mediaId] })],
);

export const episodeWatches = pgTable(
  "episode_watches",
  {
    id: serial().primaryKey(),
    userId: text().notNull().references(() => user.id, { onDelete: "cascade" }),
    mediaId: integer().notNull().references(() => media.id, { onDelete: "cascade" }),
    season: integer().notNull(),
    episode: integer().notNull(),
    watchedAt: timestamp().notNull().defaultNow(),
  },
  (t) => [uniqueIndex().on(t.userId, t.mediaId, t.season, t.episode)],
);

// season/episode use 0 when the rating targets the whole title, so the unique index works.
export const ratings = pgTable(
  "ratings",
  {
    id: serial().primaryKey(),
    userId: text().notNull().references(() => user.id, { onDelete: "cascade" }),
    mediaId: integer().notNull().references(() => media.id, { onDelete: "cascade" }),
    season: integer().notNull().default(0),
    episode: integer().notNull().default(0),
    score: integer().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex().on(t.userId, t.mediaId, t.season, t.episode),
    index().on(t.mediaId, t.season, t.episode),
    check("score_range", sql`${t.score} between 1 and 10`),
  ],
);
