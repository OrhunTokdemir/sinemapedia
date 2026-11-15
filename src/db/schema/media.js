// Small local cache of TMDB titles so feeds/profiles can render without hitting TMDB.
import { pgTable, pgEnum, serial, integer, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const mediaType = pgEnum("media_type", ["movie", "tv"]);

export const media = pgTable(
  "media",
  {
    id: serial().primaryKey(),
    tmdbId: integer().notNull(),
    type: mediaType().notNull(),
    title: text().notNull(),
    posterPath: text(),
    year: integer(),
    updatedAt: timestamp().notNull().defaultNow(),
  },
  (t) => [uniqueIndex().on(t.tmdbId, t.type)],
);
