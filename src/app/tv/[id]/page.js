import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Loading from "@/app/loading";
import CommentSection from "@/components/CommentSection";
import { PosterGrid } from "@/components/PosterCard";
import TitleHero, { CastRow, PanelSkeleton } from "@/components/TitleHero";
import TitlePanel from "@/components/TitlePanel";
import { intParam } from "@/lib/params";
import { getShow, img } from "@/lib/tmdb";

export async function generateMetadata({ params }) {
  const show = await getShow(intParam((await params).id));
  return { title: show?.name ?? "Series" };
}

export default function Page({ params }) {
  return (
    <Suspense fallback={<Loading />}>
      <ShowPage params={params} />
    </Suspense>
  );
}

async function ShowPage({ params }) {
  const id = intParam((await params).id);
  const show = await getShow(id);
  if (!show) notFound();

  return (
    <>
      <TitleHero data={show} type="tv">
        <Suspense fallback={<PanelSkeleton />}>
          <TitlePanel tmdbId={id} type="tv" tmdbScore={show.vote_average} tmdbVotes={show.vote_count} />
        </Suspense>
      </TitleHero>

      <section className="mt-8">
        <h2 className="h-section">Seasons</h2>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
          {show.seasons
            .filter((s) => s.episode_count > 0)
            .map((s) => (
              <Link key={s.id} href={`/tv/${id}/season/${s.season_number}`} className="group block">
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-border bg-surface">
                  {s.poster_path ? (
                    <Image
                      src={img(s.poster_path, "w342")}
                      alt={s.name}
                      fill
                      sizes="(max-width: 640px) 33vw, 180px"
                      className="object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-2 text-center text-xs text-muted">
                      {s.name}
                    </div>
                  )}
                </div>
                <p className="mt-1.5 line-clamp-1 text-sm font-medium group-hover:text-accent-ink">{s.name}</p>
                <p className="text-xs text-muted">
                  {s.episode_count} episodes{s.air_date && ` · ${s.air_date.slice(0, 4)}`}
                </p>
              </Link>
            ))}
        </div>
      </section>

      <CastRow cast={show.credits?.cast} />
      {show.recommendations?.results?.length > 0 && (
        <section className="mt-8">
          <PosterGrid
            items={show.recommendations.results}
            type="tv"
            rows={2}
            label="More like this"
            heading={<h2 className="h-section">More like this</h2>}
          />
        </section>
      )}
      <Suspense fallback={null}>
        <CommentSection tmdbId={id} type="tv" />
      </Suspense>
    </>
  );
}
