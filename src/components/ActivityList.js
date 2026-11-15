import ClapperIcon from "./ClapperIcon";
import Image from "next/image";
import Link from "next/link";
import { img } from "@/lib/tmdb";

const STATUS = {
  plan_to_watch: "added to their watchlist",
  watching: "started watching",
  completed: "finished",
  dropped: "dropped",
};

const ep = (p) => `S${String(p.season).padStart(2, "0")}E${String(p.episode).padStart(2, "0")}`;

function describe(a) {
  const p = a.payload ?? {};
  switch (a.type) {
    case "rated":
      return <>rated {p.season ? `${ep(p)} of ` : ""}<Title a={a} /> <b className="inline-flex items-center gap-1 text-sp"><ClapperIcon className="h-3.5 w-3.5" /> {p.score}</b></>;
    case "commented":
      return <>commented on {p.season ? `${ep(p)} of ` : ""}<Title a={a} /></>;
    case "watched_episode":
      return p.count ? (
        <>watched {p.count} episodes of season {p.season} of <Title a={a} /></>
      ) : (
        <>watched {ep(p)} of <Title a={a} /></>
      );
    case "status_changed":
      return <>{STATUS[p.status] ?? "updated"} <Title a={a} /></>;
    case "followed":
      return <>followed <Link href={`/u/${p.username}`} className="font-medium hover:text-accent-ink">@{p.username}</Link></>;
    default:
      return null;
  }
}

function Title({ a }) {
  if (!a.media?.tmdbId) return null;
  return (
    <Link href={`/${a.media.type}/${a.media.tmdbId}`} className="font-medium hover:text-accent-ink">
      {a.media.title}
    </Link>
  );
}

const fmt = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });

export default function ActivityList({ items, showActor = true }) {
  if (items.length === 0) return <p className="text-sm text-muted">No activity yet.</p>;
  return (
    <ul className="space-y-2">
      {items.map((a) => (
        <li key={a.id} className="card flex items-start gap-3 p-3 text-sm">
          {a.media?.posterPath ? (
            <div className="relative aspect-[2/3] w-10 shrink-0 overflow-hidden rounded">
              <Image src={img(a.media.posterPath, "w92")} alt="" fill sizes="40px" className="object-cover" />
            </div>
          ) : (
            <div className="w-10 shrink-0" />
          )}
          <div className="min-w-0">
            <p>
              {showActor && (
                <Link href={`/u/${a.actor.username}`} className="font-semibold hover:text-accent-ink">
                  {a.actor.name}
                </Link>
              )}{" "}
              {describe(a)}
            </p>
            {a.type === "commented" && a.payload?.excerpt && (
              <p className="mt-1 line-clamp-2 text-muted">&ldquo;{a.payload.excerpt}&rdquo;</p>
            )}
            <p className="mt-1 text-xs text-muted">{fmt.format(a.createdAt)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
