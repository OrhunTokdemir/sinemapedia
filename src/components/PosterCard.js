import Image from "next/image";
import Link from "next/link";
import { img } from "@/lib/tmdb";

/** Card for a TMDB movie/tv/person result. Works with raw TMDB objects. */
export default function PosterCard({ item, type, subtitle }) {
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
            className="object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-2 text-center text-xs text-muted">{title}</div>
        )}
        {item.vote_average > 0 && (
          <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 text-xs font-semibold text-accent">
            ★ {item.vote_average.toFixed(1)}
          </span>
        )}
      </div>
      <p className="mt-1.5 line-clamp-1 text-sm font-medium group-hover:text-accent">{title}</p>
      <p className="text-xs text-muted">{subtitle ?? (date ? date.slice(0, 4) : kind === "person" ? item.known_for_department : "")}</p>
    </Link>
  );
}

export function PosterGrid({ items, type }) {
  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
      {items.map((item) => (
        <PosterCard key={`${type ?? item.media_type}-${item.id}`} item={item} type={type} />
      ))}
    </div>
  );
}
