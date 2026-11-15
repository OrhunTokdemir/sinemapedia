import { Suspense } from "react";
import { connection } from "next/server";
import { PosterGrid, RatingLegend } from "@/components/PosterCard";
import UpNext from "@/components/UpNext";
import Loading from "./loading";
import { getPopular, getTrending } from "@/lib/tmdb";

export default function Home() {
  return (
    <div className="space-y-10">
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
        <h2 className="h-section">Trending this week</h2>
        <RatingLegend />
        <PosterGrid items={trending.filter((t) => t.media_type !== "person").slice(0, 18)} eager />
      </section>
      <section>
        <h2 className="h-section">Popular series</h2>
        <PosterGrid items={popularTv.slice(0, 12)} type="tv" />
      </section>
    </>
  );
}
