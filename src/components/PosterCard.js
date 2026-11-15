import Image from "next/image";
import Link from "next/link";
import { getCommunityScores } from "@/lib/data";
import { img } from "@/lib/tmdb";
import ClapperIcon from "./ClapperIcon";

/**
 * Card for a TMDB movie/tv/person result. Works with raw TMDB objects.
 * Badges: top-left ★ = TMDB rating, top-right clapper = Sinemapedia rating (if any).
 */
export default function PosterCard({ item, type, subtitle, eager = false, spScore }) {
  const kind = type ?? item.media_type;
  const title = item.title ?? item.name;
  const path = kind === "person" ? item.profile_path : item.poster_path;
  const date = item.release_date ?? item.first_air_date;
  const src = img(path, "w342");
  return (
    <Link href={`/${kind}/${item.id}`} className="group block">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-border bg-surface">
        {src ? (
          <Image
            src={src}
            alt={title}
            fill
            sizes="(max-width: 640px) 33vw, 180px"
            loading={eager ? "eager" : "lazy"}
            className="object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-2 text-center text-xs text-muted">{title}</div>
        )}
        {item.vote_average > 0 && (
          <span
            title="TMDB rating"
            aria-label={`TMDB rating ${item.vote_average.toFixed(1)}`}
            className="absolute left-1 top-1 rounded bg-black/70 px-1.5 text-xs font-semibold text-star"
          >
            ★ {item.vote_average.toFixed(1)}
          </span>
        )}
        {spScore && (
          <span
            title={`Sinemapedia rating · ${spScore.n} ${spScore.n === 1 ? "user" : "users"}`}
            aria-label={`Sinemapedia rating ${spScore.avg.toFixed(1)}`}
            className="absolute right-1 top-1 inline-flex items-center gap-1 rounded bg-brand px-1.5 text-xs font-semibold text-brand-fg"
          >
            <ClapperIcon className="h-3 w-3" /> {spScore.avg.toFixed(1)}
          </span>
        )}
      </div>
      <p className="mt-1.5 line-clamp-1 text-sm font-medium group-hover:text-accent-ink">{title}</p>
      <p className="text-xs text-muted">{subtitle ?? (date ? date.slice(0, 4) : kind === "person" ? item.known_for_department : "")}</p>
    </Link>
  );
}

/** Small key explaining the two rating badges. */
export function RatingLegend() {
  return (
    <p className="mb-3 -mt-1 flex items-center gap-3 text-xs text-muted">
      <span><span className="text-star">★</span> TMDB</span>
      <span className="inline-flex items-center gap-1"><ClapperIcon className="h-3 w-3 text-sp" /> Sinemapedia</span>
    </p>
  );
}

/** Poster grid; loads Sinemapedia averages for all items in one query. Render at request time. */
export async function PosterGrid({ items, type, eager = false }) {
  const scores = await getCommunityScores(items, type);
  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
      {items.map((item, i) => {
        const key = `${type ?? item.media_type}-${item.id}`;
        return <PosterCard key={key} item={item} type={type} eager={eager && i < 6} spScore={scores.get(key)} />;
      })}
    </div>
  );
}
