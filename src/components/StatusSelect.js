"use client";
import { useOptimistic, useTransition } from "react";
import { setStatus } from "@/actions/tracking";

const LABELS = {
  plan_to_watch: "Plan to watch",
  watching: "Watching",
  completed: "Completed",
  dropped: "Dropped",
};

export default function StatusSelect({ tmdbId, type, status }) {
  const [optimistic, setOptimistic] = useOptimistic(status);
  const [pending, startTransition] = useTransition();
  const options = type === "movie" ? ["plan_to_watch", "completed"] : Object.keys(LABELS);

  return (
    <select
      className="input w-auto"
      value={optimistic ?? ""}
      disabled={pending}
      aria-label="Watch status"
      onChange={(e) => {
        const next = e.target.value || null;
        startTransition(async () => {
          setOptimistic(next);
          await setStatus({ tmdbId, type, status: next });
        });
      }}
    >
      <option value="">{optimistic ? "Remove from list" : "+ Add to list"}</option>
      {options.map((s) => (
        <option key={s} value={s}>
          {type === "movie" && s === "completed" ? "Watched" : LABELS[s]}
        </option>
      ))}
    </select>
  );
}
