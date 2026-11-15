import Image from "next/image";
import Link from "next/link";
import { getTracking } from "@/lib/data";
import { getUser } from "@/lib/session";
import { img } from "@/lib/tmdb";
import { nextEpisode } from "@/lib/upnext";
import { EpisodeToggle } from "./EpisodeToggle";

/** "Up next" strip of the next episode for each show the viewer is watching. */
export default async function UpNext({ limit = 12 }) {
  const user = await getUser();
  if (!user) return null;
  const tracked = (await getTracking(user.id)).filter((t) => t.media.type === "tv" && t.status === "watching");
  const items = (
    await Promise.all(
      tracked.slice(0, limit).map(async (t) => ({ t, next: await nextEpisode(t.media.tmdbId, t.last) })),
    )
  ).filter((x) => x.next);
  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="h-section">Up next</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ t, next }) => (
          <div key={t.media.id} className="card flex items-center gap-3 p-2">
            <div className="relative aspect-[2/3] w-12 shrink-0 overflow-hidden rounded bg-background">
              {t.media.posterPath && (
                <Image src={img(t.media.posterPath, "w92")} alt="" fill sizes="48px" className="object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <Link href={`/tv/${t.media.tmdbId}`} className="line-clamp-1 font-medium hover:text-accent">
                {t.media.title}
              </Link>
              <Link
                href={`/tv/${t.media.tmdbId}/season/${next.season}/episode/${next.episode}`}
                className="line-clamp-1 text-xs text-muted hover:text-accent"
              >
                S{String(next.season).padStart(2, "0")}E{String(next.episode).padStart(2, "0")} · {next.name}
              </Link>
            </div>
            <EpisodeToggle tmdbId={t.media.tmdbId} season={next.season} episode={next.episode} watched={false} />
          </div>
        ))}
      </div>
    </section>
  );
}
