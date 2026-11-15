import { Suspense } from "react";
import { notFound } from "next/navigation";
import Loading from "@/app/loading";
import CommentSection from "@/components/CommentSection";
import { PosterGrid } from "@/components/PosterCard";
import TitleHero, { CastRow, PanelSkeleton } from "@/components/TitleHero";
import TitlePanel from "@/components/TitlePanel";
import { intParam } from "@/lib/params";
import { getMovie } from "@/lib/tmdb";

export async function generateMetadata({ params }) {
  const movie = await getMovie(intParam((await params).id));
  return { title: movie?.title ?? "Movie" };
}

export default function Page({ params }) {
  return (
    <Suspense fallback={<Loading />}>
      <MoviePage params={params} />
    </Suspense>
  );
}

async function MoviePage({ params }) {
  const id = intParam((await params).id);
  const movie = await getMovie(id);
  if (!movie) notFound();

  return (
    <>
      <TitleHero data={movie} type="movie">
        <Suspense fallback={<PanelSkeleton />}>
          <TitlePanel tmdbId={id} type="movie" />
        </Suspense>
      </TitleHero>
      <CastRow cast={movie.credits?.cast} />
      {movie.recommendations?.results?.length > 0 && (
        <section className="mt-8">
          <h2 className="h-section">More like this</h2>
          <PosterGrid items={movie.recommendations.results.slice(0, 6)} type="movie" />
        </section>
      )}
      <Suspense fallback={null}>
        <CommentSection tmdbId={id} type="movie" />
      </Suspense>
    </>
  );
}
