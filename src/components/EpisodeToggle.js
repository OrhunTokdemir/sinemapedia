"use client";
import { useOptimistic, useTransition } from "react";
import { markSeason, toggleEpisode } from "@/actions/tracking";

export function EpisodeToggle({ tmdbId, season, episode, watched, disabled }) {
  const [optimistic, setOptimistic] = useOptimistic(watched);
  const [, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={optimistic}
      title={disabled ? "Not aired yet" : optimistic ? "Mark unwatched" : "Mark watched"}
      onClick={() =>
        startTransition(async () => {
          setOptimistic(!optimistic);
          await toggleEpisode({ tmdbId, season, episode, watched: !optimistic });
        })
      }
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm disabled:opacity-30 ${
        optimistic ? "border-accent bg-accent text-accent-fg" : "border-border hover:border-accent"
      }`}
    >
      ✓
    </button>
  );
}

export function SeasonToggle({ tmdbId, season, allWatched }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      className="btn"
      disabled={pending}
      onClick={() => startTransition(() => markSeason({ tmdbId, season, watched: !allWatched }))}
    >
      {pending ? "Saving…" : allWatched ? "Unmark season" : "Mark season watched"}
    </button>
  );
}
