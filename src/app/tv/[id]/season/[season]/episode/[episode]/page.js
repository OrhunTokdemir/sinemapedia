import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CommentSection from "@/components/CommentSection";
import { EpisodeToggle } from "@/components/EpisodeToggle";
import { CastRow, PanelSkeleton } from "@/components/TitleHero";
import TitlePanel from "@/components/TitlePanel";
import { getWatchedSet } from "@/lib/data";
import { intParam } from "@/lib/params";
import { getUser } from "@/lib/session";
import { getEpisode, getShow, img } from "@/lib/tmdb";

export async function generateMetadata({ params }) {
  const p = await params;
  const ep = await getEpisode(intParam(p.id), intParam(p.season, { min: 0 }), intParam(p.episode));
  return { title: ep?.name ?? "Episode" };
}

export default async function EpisodePage({ params }) {
  const p = await params;
  const id = intParam(p.id);
  const season = intParam(p.season, { min: 0 });
  const episode = intParam(p.episode);
  const [show, ep] = await Promise.all([getShow(id), getEpisode(id, season, episode)]);
  if (!show || !ep) notFound();
  const code = `S${String(season).padStart(2, "0")}E${String(episode).padStart(2, "0")}`;

  return (
    <div>
      <p className="text-sm text-muted">
        <Link href={`/tv/${id}`} className="hover:text-accent">{show.name}</Link> ·{" "}
        <Link href={`/tv/${id}/season/${season}`} className="hover:text-accent">Season {season}</Link>
      </p>
      <div className="mt-2 flex flex-col gap-6 md:flex-row">
        {ep.still_path && (
          <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg md:w-96">
            <Image src={img(ep.still_path, "w780")} alt="" fill sizes="384px" className="object-cover" priority />
          </div>
        )}
        <div className="flex-1 space-y-3">
          <h1 className="text-2xl font-bold">
            <span className="text-muted">{code}</span> {ep.name}
          </h1>
          <p className="text-sm text-muted">
            {ep.air_date ?? "TBA"}
            {ep.runtime ? ` · ${ep.runtime} min` : ""}
            {ep.vote_average > 0 ? ` · ★ ${ep.vote_average.toFixed(1)} TMDB` : ""}
          </p>
          <p className="leading-relaxed">{ep.overview}</p>
          <Suspense fallback={<PanelSkeleton />}>
            <div className="flex flex-wrap items-center gap-3">
              <WatchedToggle id={id} season={season} episode={episode} airDate={ep.air_date} />
              <div className="flex-1">
                <TitlePanel tmdbId={id} type="tv" season={season} episode={episode} />
              </div>
            </div>
          </Suspense>
        </div>
      </div>
      <CastRow cast={[...(ep.credits?.cast ?? []), ...(ep.guest_stars ?? [])]} />
      <Suspense fallback={null}>
        <CommentSection tmdbId={id} type="tv" season={season} episode={episode} />
      </Suspense>
    </div>
  );
}

async function WatchedToggle({ id, season, episode, airDate }) {
  const user = await getUser();
  if (!user) return null;
  const watched = (await getWatchedSet(user.id, id)).has(`${season}:${episode}`);
  const aired = airDate && airDate <= new Date().toISOString().slice(0, 10);
  return (
    <div className="flex items-center gap-2 text-sm">
      <EpisodeToggle tmdbId={id} season={season} episode={episode} watched={watched} disabled={!aired && !watched} />
      {watched ? "Watched" : "Mark watched"}
    </div>
  );
}
