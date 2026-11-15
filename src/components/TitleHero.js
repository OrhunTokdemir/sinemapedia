import Image from "next/image";
import Link from "next/link";
import { img } from "@/lib/tmdb";

export default function TitleHero({ data, type, children }) {
  const title = data.title ?? data.name;
  const date = data.release_date ?? data.first_air_date;
  const runtime = type === "movie" ? data.runtime : data.episode_run_time?.[0];
  const backdrop = img(data.backdrop_path, "w1280");
  const poster = img(data.poster_path, "w500");
  const directors =
    type === "movie"
      ? data.credits?.crew?.filter((c) => c.job === "Director")
      : data.created_by;

  return (
    <section className="relative -mx-4 -mt-6 overflow-hidden px-4 pb-6 pt-8">
      {backdrop && (
        <Image src={backdrop} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-15" />
      )}
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="relative aspect-[2/3] w-40 shrink-0 overflow-hidden rounded-lg border border-border bg-surface sm:w-56">
          {poster && <Image src={poster} alt={title} fill sizes="224px" className="object-cover" priority />}
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <h1 className="text-3xl font-bold">
            {title} {date && <span className="font-normal text-muted">({date.slice(0, 4)})</span>}
          </h1>
          <p className="text-sm text-muted">
            {[
              type === "tv" ? "TV Series" : "Movie",
              data.genres?.map((g) => g.name).join(", "),
              runtime ? `${runtime} min` : null,
              type === "tv" ? `${data.number_of_seasons} seasons · ${data.status}` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {data.vote_average > 0 && (
            <p className="text-sm">
              <span className="text-accent">★</span> {data.vote_average.toFixed(1)}
              <span className="text-muted"> TMDB ({data.vote_count.toLocaleString()} votes)</span>
            </p>
          )}
          {data.tagline && <p className="italic text-muted">{data.tagline}</p>}
          <p className="max-w-3xl leading-relaxed">{data.overview}</p>
          {directors?.length > 0 && (
            <p className="text-sm">
              <span className="text-muted">{type === "movie" ? "Director" : "Created by"}: </span>
              {directors.map((d, i) => (
                <span key={d.id}>
                  {i > 0 && ", "}
                  <Link href={`/person/${d.id}`} className="hover:text-accent">{d.name}</Link>
                </span>
              ))}
            </p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}

export function CastRow({ cast }) {
  if (!cast?.length) return null;
  return (
    <section className="mt-8">
      <h2 className="h-section">Cast</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {cast.slice(0, 15).map((p) => (
          <Link key={p.credit_id ?? p.id} href={`/person/${p.id}`} className="group w-24 shrink-0">
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-border bg-surface">
              {p.profile_path && (
                <Image src={img(p.profile_path, "w185")} alt={p.name} fill sizes="96px" className="object-cover" />
              )}
            </div>
            <p className="mt-1 line-clamp-1 text-xs font-medium group-hover:text-accent">{p.name}</p>
            <p className="line-clamp-1 text-xs text-muted">{p.character ?? p.roles?.[0]?.character}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function PanelSkeleton() {
  return <div className="card h-[74px] animate-pulse" />;
}
