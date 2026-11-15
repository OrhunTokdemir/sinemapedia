"use client";
import { useOptimistic, useState, useTransition } from "react";
import { rate } from "@/actions/ratings";
import ClapperIcon from "./ClapperIcon";

/** Sinemapedia rating input (1–10). Uses the clapperboard icon; ★ is reserved for TMDB scores. */
export default function RatingStars({ tmdbId, type, season = 0, episode = 0, score }) {
  const [optimistic, setOptimistic] = useOptimistic(score);
  const [hover, setHover] = useState(null);
  const [, startTransition] = useTransition();
  const shown = hover ?? optimistic ?? 0;

  function submit(value) {
    const next = value === optimistic ? null : value; // click same star again to clear
    startTransition(async () => {
      setOptimistic(next);
      await rate({ tmdbId, type, season, episode, score: next });
    });
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex" onMouseLeave={() => setHover(null)} role="radiogroup" aria-label="Your rating">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={optimistic === v}
            aria-label={`${v} out of 10`}
            onMouseEnter={() => setHover(v)}
            onClick={() => submit(v)}
            className={`p-0.5 leading-none ${v <= shown ? "text-sp" : "text-border"}`}
          >
            <ClapperIcon className="h-5 w-5" />
          </button>
        ))}
      </div>
      <span className="w-10 text-sm text-muted">{optimistic ? `${optimistic}/10` : "Rate"}</span>
    </div>
  );
}
