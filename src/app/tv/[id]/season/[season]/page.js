import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EpisodeToggle, SeasonToggle } from "@/components/EpisodeToggle";
import { getWatchedSet } from "@/lib/data";
import { intParam } from "@/lib/params";
import { getUser } from "@/lib/session";
import { getSeason, getShow, img } from "@/lib/tmdb";

export async function generateMetadata({ params }) {
  const p = await params;
  const show = await getShow(intParam(p.id));
  return { title: show ? `${show.name}: Season ${p.season}` : "Season" };
}

export default async function SeasonPage({ params }) {
  const p = await params;
  const id = intParam(p.id);
  const seasonNo = intParam(p.season, { min: 0 });
  const [show, season] = await Promise.all([getShow(id), getSeason(id, seasonNo)]);
  if (!show || !season) notFound();

  return (
    <div>
      <p className="text-sm text-muted">
        <Link href={`/tv/${id}`} className="hover:text-accent">{show.name}</Link>
      </p>
      <h1 className="mb-1 text-2xl font-bold">{season.name}</h1>
      {season.overview && <p className="mb-4 max-w-3xl text-muted">{season.overview}</p>}

      <Suspense fallback={<EpisodeList id={id} season={season} watched={null} />}>
        <WatchedEpisodes id={id} season={season} />
      </Suspense>
    </div>
  );
}

async function WatchedEpisodes({ id, season }) {
  const user = await getUser();
  const watched = user ? await getWatchedSet(user.id, id) : null;
  return <EpisodeList id={id} season={season} watched={watched} />;
}

function EpisodeList({ id, season, watched }) {
  const today = new Date().toISOString().slice(0, 10);
  const aired = season.episodes.filter((e) => e.air_date && e.air_date <= today);
  const allWatched = watched && aired.length > 0 && aired.every((e) => watched.has(`${season.season_number}:${e.episode_number}`));

  return (
    <>
      {watched && (
        <div className="mb-4 flex items-center gap-3">
          <SeasonToggle tmdbId={id} season={season.season_number} allWatched={allWatched} />
          <span className="text-sm text-muted">
            {aired.filter((e) => watched.has(`${season.season_number}:${e.episode_number}`)).length}/{aired.length} watched
          </span>
        </div>
      )}
      <ol className="space-y-3">
        {season.episodes.map((e) => {
          const key = `${season.season_number}:${e.episode_number}`;
          const hasAired = e.air_date && e.air_date <= today;
          return (
            <li key={e.id} className="card flex gap-3 p-3">
              <div className="relative hidden aspect-video w-40 shrink-0 overflow-hidden rounded bg-background sm:block">
                {e.still_path && (
                  <Image src={img(e.still_path, "w300")} alt="" fill sizes="160px" className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/tv/${id}/season/${season.season_number}/episode/${e.episode_number}`}
                  className="font-medium hover:text-accent"
                >
                  {e.episode_number}. {e.name}
                </Link>
                <p className="text-xs text-muted">
                  {e.air_date ?? "TBA"}
                  {e.runtime ? ` · ${e.runtime} min` : ""}
                  {e.vote_average > 0 ? ` · ★ ${e.vote_average.toFixed(1)}` : ""}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{e.overview}</p>
              </div>
              {watched && (
                <EpisodeToggle
                  tmdbId={id}
                  season={season.season_number}
                  episode={e.episode_number}
                  watched={watched.has(key)}
                  disabled={!hasAired && !watched.has(key)}
                />
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
}
