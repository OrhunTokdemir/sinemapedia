import { Suspense } from "react";
import { connection } from "next/server";
import { PosterGrid, RatingLegend } from "@/components/PosterCard";
import UpNext from "@/components/UpNext";
import Featured, { FeaturedSkeleton } from "@/components/Featured";
import Loading from "./loading";
import { getPopular, getTrending } from "@/lib/tmdb";

export default function Home() {
  return (
    <div className="space-y-10">
      <Suspense fallback={<FeaturedSkeleton />}>
        <Featured />
      </Suspense>
      <Suspense fallback={null}>
        <UpNext limit={6} />
      </Suspense>
      <Suspense fallback={<Loading />}>
        <Discover />
      </Suspense>
    </div>
  );
}

// Fetched at request time (still cached via 'use cache' in lib/tmdb) so builds don't need the TMDB token.
async function Discover() {
  await connection();
  const [trending, popularTv] = await Promise.all([getTrending("all"), getPopular("tv")]);
  return (
    <>
      <section>
        <PosterGrid
          items={trending.filter((t) => t.media_type !== "person")}
          eager
          rows={2}
          label="Trending this week"
          heading={
            <>
              <h2 className="h-section">Trending this week</h2>
              <RatingLegend />
            </>
          }
        />
      </section>
      <section>
        <PosterGrid items={popularTv} type="tv" rows={2} label="Popular series" heading={<h2 className="h-section">Popular series</h2>} />
      </section>
    </>
  );
}
