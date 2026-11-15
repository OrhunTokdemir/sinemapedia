import { Suspense } from "react";
import Loading from "@/app/loading";
import { PosterGrid, RatingLegend } from "@/components/PosterCard";
import { search } from "@/lib/tmdb";

export const metadata = { title: "Search" };

export default function Page({ searchParams }) {
  return (
    <Suspense fallback={<Loading />}>
      <SearchPage searchParams={searchParams} />
    </Suspense>
  );
}

async function SearchPage({ searchParams }) {
  const { q = "" } = await searchParams;
  const query = String(q).slice(0, 100);
  const data = await search(query);
  const results = data?.results ?? [];

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">
        {query ? <>Results for &ldquo;{query}&rdquo;</> : "Search"}
      </h1>
      {query && results.length === 0 && <p className="text-muted">Nothing found.</p>}
      {results.length > 0 && <RatingLegend />}
      <PosterGrid items={results} eager />
    </div>
  );
}
