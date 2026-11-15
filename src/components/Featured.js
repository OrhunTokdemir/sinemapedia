import { connection } from "next/server";
import { getGenres, getTrending, getUpcoming, img } from "@/lib/tmdb";
import FeaturedCarousel from "./FeaturedCarousel";

const UPCOMING = 4;
const POPULAR = 4;

/** Steam-style featured carousel: most anticipated upcoming + most popular current titles. */
export default async function Featured() {
  await connection();
  const today = new Date().toISOString().slice(0, 10);
  const [upTv, upMovie, trending, tvGenres, movieGenres] = await Promise.all([
    getUpcoming("tv", today),
    getUpcoming("movie", today),
    getTrending("all"),
    getGenres("tv"),
    getGenres("movie"),
  ]);
  const genres = { tv: tvGenres, movie: movieGenres };

  const seen = new Set();
  const take = (list, kind, status, n, out) => {
    for (const item of list) {
      if (out.length >= n) break;
      const type = kind ?? item.media_type;
      const key = `${type}-${item.id}`;
      if (!item.backdrop_path || seen.has(key) || (type !== "tv" && type !== "movie")) continue;
      seen.add(key);
      out.push(toSlide(item, type, status, genres[type]));
    }
    return out;
  };

  // Upcoming: alternate series and movies.
  const tv = take(upTv, "tv", "upcoming", UPCOMING / 2, []);
  const movies = take(upMovie, "movie", "upcoming", UPCOMING / 2, []);
  const upcoming = interleave(tv, movies);
  const popular = take(trending, null, "popular", POPULAR, []);
  const slides = interleave(popular, upcoming);

  if (!slides.length) return null;
  return <FeaturedCarousel slides={slides} />;
}

function interleave(a, b) {
  const out = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i]) out.push(a[i]);
    if (b[i]) out.push(b[i]);
  }
  return out;
}

function toSlide(item, type, status, genreMap) {
  const date = item.release_date || item.first_air_date || null;
  return {
    key: `${type}-${item.id}`,
    href: `/${type}/${item.id}`,
    title: item.title ?? item.name,
    year: date ? date.slice(0, 4) : null,
    kind: type,
    status,
    date,
    overview: item.overview ?? "",
    genres: (item.genre_ids ?? []).map((id) => genreMap?.[id]).filter(Boolean).slice(0, 3),
    score: item.vote_count >= 20 ? item.vote_average : 0,
    backdrop: img(item.backdrop_path, "w1280"),
  };
}

export function FeaturedSkeleton() {
  return (
    <div className="card grid animate-pulse overflow-hidden md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]" aria-hidden>
      <div className="aspect-video bg-border/40" />
      <div className="space-y-3 p-5">
        <div className="h-6 w-3/4 rounded bg-border/50" />
        <div className="h-4 w-1/3 rounded bg-border/50" />
        <div className="h-20 rounded bg-border/40" />
      </div>
    </div>
  );
}
