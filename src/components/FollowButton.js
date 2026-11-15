"use client";
import { useOptimistic, useTransition } from "react";
import { setFollow } from "@/actions/follows";

export default function FollowButton({ userId, isFollowing }) {
  const [optimistic, setOptimistic] = useOptimistic(isFollowing);
  const [, startTransition] = useTransition();
  return (
    <button
      type="button"
      className={optimistic ? "btn" : "btn-primary"}
      onClick={() =>
        startTransition(async () => {
          setOptimistic(!optimistic);
          await setFollow(userId, !optimistic);
        })
      }
    >
      {optimistic ? "Following" : "Follow"}
    </button>
  );
}
