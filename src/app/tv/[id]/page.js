import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
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

export default async function ShowPage({ params }) {
  const id = intParam((await params).id);
  const show = await getShow(id);
  if (!show) notFound();

  return (
    <>
      <TitleHero data={show} type="tv">
        <Suspense fallback={<PanelSkeleton />}>
          <TitlePanel tmdbId={id} type="tv" />
        </Suspense>
      </TitleHero>

      <section className="mt-8">
        <h2 className="h-section">Seasons</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {show.seasons
            .filter((s) => s.episode_count > 0)
            .map((s) => (
              <Link
                key={s.id}
                href={`/tv/${id}/season/${s.season_number}`}
                className="card flex gap-3 p-2 hover:border-accent"
              >
                <div className="relative aspect-[2/3] w-12 shrink-0 overflow-hidden rounded bg-background">
                  {s.poster_path && (
                    <Image src={img(s.poster_path, "w92")} alt="" fill sizes="48px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 text-sm">
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-muted">
                    {s.episode_count} episodes{s.air_date && ` · ${s.air_date.slice(0, 4)}`}
                  </p>
                </div>
              </Link>
            ))}
        </div>
      </section>

      <CastRow cast={show.credits?.cast} />
      {show.recommendations?.results?.length > 0 && (
        <section className="mt-8">
          <h2 className="h-section">More like this</h2>
          <PosterGrid items={show.recommendations.results.slice(0, 6)} type="tv" />
        </section>
      )}
      <Suspense fallback={null}>
        <CommentSection tmdbId={id} type="tv" />
      </Suspense>
    </>
  );
}
