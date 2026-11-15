import { Suspense } from "react";
import Image from "next/image";
import Loading from "@/app/loading";
import { notFound } from "next/navigation";
import { PosterGrid } from "@/components/PosterCard";
import { intParam } from "@/lib/params";
import { getPerson, img } from "@/lib/tmdb";

export async function generateMetadata({ params }) {
  const person = await getPerson(intParam((await params).id));
  return { title: person?.name ?? "Person" };
}

export default function Page({ params }) {
  return (
    <Suspense fallback={<Loading />}>
      <PersonPage params={params} />
    </Suspense>
  );
}

async function PersonPage({ params }) {
  const person = await getPerson(intParam((await params).id));
  if (!person) notFound();

  // Dedupe credits (same title can appear for several roles) and sort by popularity.
  const seen = new Set();
  const credits = [...(person.combined_credits?.cast ?? []), ...(person.combined_credits?.crew ?? [])]
    .filter((c) => c.media_type !== "person" && !seen.has(`${c.media_type}-${c.id}`) && seen.add(`${c.media_type}-${c.id}`))
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 30);

  return (
    <div>
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="relative aspect-[2/3] w-40 shrink-0 overflow-hidden rounded-lg border border-border bg-surface sm:w-52">
          {person.profile_path && (
            <Image src={img(person.profile_path, "w500")} alt={person.name} fill sizes="208px" className="object-cover" loading="eager" />
          )}
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">{person.name}</h1>
          <p className="text-sm text-muted">
            {[person.known_for_department, person.birthday && `Born ${person.birthday}`, person.place_of_birth]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <p className="max-w-3xl whitespace-pre-line leading-relaxed">{person.biography || "No biography available."}</p>
        </div>
      </div>
      <section className="mt-8">
        <h2 className="h-section">Known for</h2>
        <PosterGrid items={credits} />
      </section>
    </div>
  );
}
