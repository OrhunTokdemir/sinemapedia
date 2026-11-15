import Link from "next/link";
import { getTitleState } from "@/lib/data";
import { getUser } from "@/lib/session";
import RatingStars from "./RatingStars";
import StatusSelect from "./StatusSelect";

/** Per-user controls + community rating. Reads the session, so render inside <Suspense>. */
export default async function TitlePanel({ tmdbId, type, season = 0, episode = 0 }) {
  const viewer = await getUser();
  const s = await getTitleState({ tmdbId, type, season, episode, userId: viewer?.id });

  return (
    <div className="card flex flex-wrap items-center gap-x-6 gap-y-3 p-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted">Sinemapedia rating</p>
        <p className="text-lg font-semibold">
          {s.avgScore ? (
            <>
              <span className="text-accent">★</span> {s.avgScore.toFixed(1)}
              <span className="text-sm font-normal text-muted"> /10 · {s.ratingCount}</span>
            </>
          ) : (
            <span className="text-sm font-normal text-muted">No ratings yet</span>
          )}
        </p>
      </div>
      {viewer ? (
        <>
          <RatingStars tmdbId={tmdbId} type={type} season={season} episode={episode} score={s.myScore} />
          {season === 0 && <StatusSelect tmdbId={tmdbId} type={type} status={s.status} />}
        </>
      ) : (
        <p className="text-sm text-muted">
          <Link href="/login" className="text-accent underline">Log in</Link> to rate and track.
        </p>
      )}
    </div>
  );
}
