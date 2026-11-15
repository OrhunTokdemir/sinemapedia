"use client";
import { useActionState, useEffect, useRef } from "react";
import { addComment } from "@/actions/comments";

export default function CommentForm({ target, parentId, onDone, autoFocus }) {
  const [state, action, pending] = useActionState(addComment, null);
  const formRef = useRef(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      onDone?.();
    }
  }, [state, onDone]);

  return (
    <form ref={formRef} action={action} className="card space-y-2 p-3">
      <input type="hidden" name="tmdbId" value={target.tmdbId} />
      <input type="hidden" name="type" value={target.type} />
      <input type="hidden" name="season" value={target.season} />
      <input type="hidden" name="episode" value={target.episode} />
      {parentId && <input type="hidden" name="parentId" value={parentId} />}
      <textarea
        name="body"
        required
        maxLength={5000}
        rows={parentId ? 2 : 3}
        autoFocus={autoFocus}
        placeholder={parentId ? "Write a reply…" : "What did you think?"}
        className="input resize-y"
      />
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" name="spoiler" /> Contains spoilers
        </label>
        <div className="flex items-center gap-2">
          {state?.error && <span className="text-sm text-red-500">{state.error}</span>}
          {onDone && (
            <button type="button" className="btn" onClick={onDone}>Cancel</button>
          )}
          <button className="btn-primary" disabled={pending}>
            {pending ? "Posting…" : parentId ? "Reply" : "Post"}
          </button>
        </div>
      </div>
    </form>
  );
}
