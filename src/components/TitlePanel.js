import Link from "next/link";
import { getTitleState } from "@/lib/data";
import { getUser } from "@/lib/session";
import RatingStars from "./RatingStars";
import StatusSelect from "./StatusSelect";
import ClapperIcon from "./ClapperIcon";

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

function TmdbBadge({ score, votes }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-sm">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">TMDB</span>
      {score > 0 ? (
        <>
          <span className="font-semibold">
            <span className="text-star">★</span> {score.toFixed(1)}
          </span>
          <span className="text-xs text-muted">· {compact.format(votes)} votes</span>
        </>
      ) : (
        <span className="text-muted">—</span>
      )}
    </span>
  );
}

/**
 * TMDB score as a small badge, then the Sinemapedia box holding the community score
 * and the viewer's own rating (so it's clear which score you're rating). Render inside <Suspense>.
 */
export default async function TitlePanel({ tmdbId, type, season = 0, episode = 0, tmdbScore = 0, tmdbVotes = 0 }) {
  const viewer = await getUser();
  const s = await getTitleState({ tmdbId, type, season, episode, userId: viewer?.id });

  return (
    <div className="space-y-3">
      <TmdbBadge score={tmdbScore} votes={tmdbVotes} />

      <div className="card w-fit max-w-full space-y-2 p-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Sinemapedia</p>
          <p className="text-lg font-bold">
            {s.avgScore ? (
              <>
                <ClapperIcon className="h-4 w-4 text-sp" /> {s.avgScore.toFixed(1)}
                <span className="text-sm font-normal text-muted">
                  {" "}/10 · {s.ratingCount} {s.ratingCount === 1 ? "user" : "users"}
                </span>
              </>
            ) : (
              <span className="text-sm font-normal text-muted">No ratings yet</span>
            )}
          </p>
        </div>
        <div className="border-t border-border pt-2">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Your rating</p>
          {viewer ? (
            <RatingStars tmdbId={tmdbId} type={type} season={season} episode={episode} score={s.myScore} />
          ) : (
            <p className="text-sm text-muted">
              <Link href="/login" className="text-accent-ink underline">Log in</Link> to rate.
            </p>
          )}
        </div>
      </div>

      {viewer && season === 0 && <StatusSelect tmdbId={tmdbId} type={type} status={s.status} />}
    </div>
  );
}
