import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import StatusSelect from "@/components/StatusSelect";
import UpNext from "@/components/UpNext";
import { getTracking } from "@/lib/data";
import { requireUser } from "@/lib/session";
import { img } from "@/lib/tmdb";
import { showProgress } from "@/lib/upnext";

export const metadata = { title: "Tracking" };

const GROUPS = [
  ["watching", "Watching"],
  ["plan_to_watch", "Plan to watch"],
  ["completed", "Completed"],
  ["dropped", "Dropped"],
];

export default function Page() {
  return (
    <Suspense fallback={<div className="card h-40 animate-pulse" />}>
      <TrackingPage />
    </Suspense>
  );
}

async function TrackingPage() {
  const user = await requireUser();
  const rows = await getTracking(user.id);
  const withProgress = await Promise.all(
    rows.map(async (r) => ({
      ...r,
      progress: r.media.type === "tv" ? await showProgress(r.media.tmdbId, r.watchedCount) : null,
    })),
  );

  return (
    <div className="space-y-10">
      <Suspense fallback={null}>
        <UpNext />
      </Suspense>
      {rows.length === 0 && (
        <p className="card p-4 text-sm text-muted">
          You aren&apos;t tracking anything yet. Open a series or movie and use &ldquo;Add to list&rdquo;.
        </p>
      )}
      {GROUPS.map(([key, label]) => {
        const items = withProgress.filter((r) => r.status === key);
        if (items.length === 0) return null;
        return (
          <section key={key}>
            <h2 className="h-section">
              {label} <span className="text-muted">({items.length})</span>
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {items.map((r) => (
                <li key={r.media.id} className="card flex gap-3 p-2">
                  <div className="relative aspect-[2/3] w-14 shrink-0 overflow-hidden rounded bg-background">
                    {r.media.posterPath && (
                      <Image src={img(r.media.posterPath, "w92")} alt="" fill sizes="56px" className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Link href={`/${r.media.type}/${r.media.tmdbId}`} className="line-clamp-1 font-medium hover:text-accent-ink">
                      {r.media.title} {r.media.year && <span className="text-muted">({r.media.year})</span>}
                    </Link>
                    {r.progress && (
                      <div>
                        <div className="h-1.5 overflow-hidden rounded bg-border">
                          <div className="h-full bg-accent" style={{ width: `${r.progress.pct}%` }} />
                        </div>
                        <p className="mt-0.5 text-xs text-muted">
                          {r.progress.watched}/{r.progress.aired} episodes
                        </p>
                      </div>
                    )}
                    <StatusSelect tmdbId={r.media.tmdbId} type={r.media.type} status={r.status} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
