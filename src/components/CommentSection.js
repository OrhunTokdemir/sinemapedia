import Link from "next/link";
import { getComments } from "@/lib/data";
import { getUser } from "@/lib/session";
import CommentForm from "./CommentForm";
import CommentThread from "./CommentThread";

/** Server component: loads comments for a title/episode and renders the thread. */
export default async function CommentSection({ tmdbId, type, season = 0, episode = 0 }) {
  const viewer = await getUser();
  const rows = await getComments({ tmdbId, type, season, episode, viewerId: viewer?.id });

  // Build a reply tree; serialize dates for the client component.
  const byParent = new Map();
  for (const c of rows) {
    const node = { ...c, createdAt: c.createdAt.toISOString(), editedAt: c.editedAt?.toISOString() ?? null };
    const key = c.parentId ?? 0;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(node);
  }
  const attach = (list) => list.map((c) => ({ ...c, replies: attach(byParent.get(c.id) ?? []) }));
  const tree = attach(byParent.get(0) ?? []).reverse(); // newest top-level first
  const target = { tmdbId, type, season, episode };

  return (
    <section className="mt-10">
      <h2 className="h-section">Comments ({rows.filter((c) => !c.deletedAt).length})</h2>
      {viewer ? (
        <CommentForm target={target} />
      ) : (
        <p className="card p-4 text-sm text-muted">
          <Link href="/login" className="text-accent-ink underline">Log in</Link> to join the discussion.
        </p>
      )}
      <CommentThread comments={tree} target={target} viewerId={viewer?.id ?? null} />
    </section>
  );
}
