"use client";
import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { deleteComment, editComment, toggleLike } from "@/actions/comments";
import CommentForm from "./CommentForm";

const fmt = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });

export default function CommentThread({ comments, target, viewerId, depth = 0 }) {
  if (comments.length === 0) {
    return depth === 0 ? <p className="mt-4 text-sm text-muted">No comments yet.</p> : null;
  }
  return (
    <ul className={depth === 0 ? "mt-4 space-y-4" : "mt-3 space-y-3 border-l border-border pl-4"}>
      {comments.map((c) => (
        <Comment key={c.id} c={c} target={target} viewerId={viewerId} depth={depth} />
      ))}
    </ul>
  );
}

function Comment({ c, target, viewerId, depth }) {
  const [revealed, setRevealed] = useState(!c.spoiler);
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(c.body ?? "");
  const [like, setLike] = useOptimistic({ liked: c.liked, likes: c.likes });
  const [pending, startTransition] = useTransition();
  const mine = viewerId && viewerId === c.author.id;
  const deleted = c.body === null;

  return (
    <li>
      <div className="text-sm">
        <div className="flex items-baseline gap-2">
          {deleted ? (
            <span className="text-muted">[deleted]</span>
          ) : (
            <Link href={`/u/${c.author.username}`} className="font-semibold hover:text-accent">
              {c.author.name} <span className="font-normal text-muted">@{c.author.username}</span>
            </Link>
          )}
          <span className="text-xs text-muted">
            {fmt.format(new Date(c.createdAt))}
            {c.editedAt && " · edited"}
          </span>
        </div>

        {deleted ? (
          <p className="mt-1 italic text-muted">This comment was deleted.</p>
        ) : editing ? (
          <div className="mt-2 space-y-2">
            <textarea className="input" rows={3} value={draft} onChange={(e) => setDraft(e.target.value)} />
            <div className="flex gap-2">
              <button
                className="btn-primary"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await editComment({ id: c.id, body: draft });
                    setEditing(false);
                  })
                }
              >
                Save
              </button>
              <button className="btn" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </div>
        ) : revealed ? (
          <p className="mt-1 whitespace-pre-wrap break-words">{c.body}</p>
        ) : (
          <button className="mt-1 rounded bg-border px-2 py-1 text-xs" onClick={() => setRevealed(true)}>
            Spoiler hidden. Click to reveal.
          </button>
        )}

        {!deleted && !editing && (
          <div className="mt-1 flex gap-3 text-xs text-muted">
            <button
              disabled={!viewerId}
              className={like.liked ? "text-accent" : "hover:text-foreground"}
              onClick={() =>
                startTransition(async () => {
                  setLike({ liked: !like.liked, likes: like.likes + (like.liked ? -1 : 1) });
                  await toggleLike(c.id, !like.liked);
                })
              }
            >
              ♥ {like.likes}
            </button>
            {viewerId && depth < 4 && (
              <button className="hover:text-foreground" onClick={() => setReplying((r) => !r)}>Reply</button>
            )}
            {mine && (
              <>
                <button className="hover:text-foreground" onClick={() => setEditing(true)}>Edit</button>
                <button
                  className="hover:text-red-500"
                  onClick={() => {
                    if (confirm("Delete this comment?")) startTransition(() => deleteComment(c.id));
                  }}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {replying && (
        <div className="mt-2">
          <CommentForm target={target} parentId={c.id} autoFocus onDone={() => setReplying(false)} />
        </div>
      )}
      <CommentThread comments={c.replies} target={target} viewerId={viewerId} depth={depth + 1} />
    </li>
  );
}
