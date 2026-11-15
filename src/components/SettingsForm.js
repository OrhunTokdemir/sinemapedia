"use client";
import { useActionState, useState } from "react";
import { updateProfile } from "@/actions/profile";
import { DEFAULT_AVATARS, isDefaultAvatar } from "@/lib/avatars";

export default function SettingsForm({ user }) {
  const [state, action, pending] = useActionState(updateProfile, null);
  // "auto" = no image saved (automatic default), a built-in path, or "custom" (own https URL).
  const [choice, setChoice] = useState(!user.image ? "auto" : isDefaultAvatar(user.image) ? user.image : "custom");
  const [customUrl, setCustomUrl] = useState(isDefaultAvatar(user.image) ? "" : user.image);

  const image = choice === "auto" ? "" : choice === "custom" ? customUrl : choice;
  const preview = choice === "auto" ? user.autoAvatar : choice === "custom" ? customUrl || user.autoAvatar : choice;

  const tile = (selected) =>
    `relative block cursor-pointer rounded-full ring-2 ring-offset-2 ring-offset-surface transition has-[:focus-visible]:ring-accent ${
      selected ? "ring-accent" : "ring-transparent hover:ring-border"
    }`;

  return (
    <form action={action} className="card space-y-5 p-6">
      <p className="text-sm text-muted">Username: @{user.username}</p>

      <fieldset className="space-y-3">
        <legend className="mb-2 text-sm">Profile picture</legend>
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Selected profile picture" className="h-16 w-16 rounded-full bg-background object-cover ring-2 ring-border" />
          <div className="flex flex-wrap gap-3">
            {DEFAULT_AVATARS.map((a) => (
              <label key={a.id} className={tile(choice === a.src)} title={a.label}>
                <input type="radio" name="avatarChoice" value={a.src} checked={choice === a.src} onChange={() => setChoice(a.src)} className="sr-only" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.src} alt={a.label} className="h-11 w-11 rounded-full" />
              </label>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" name="avatarChoice" value="auto" checked={choice === "auto"} onChange={() => setChoice("auto")} />
            Automatic
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="avatarChoice" value="custom" checked={choice === "custom"} onChange={() => setChoice("custom")} />
            Custom image URL
          </label>
        </div>
        {choice === "custom" && (
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="input"
            placeholder="https://…"
            aria-label="Custom image URL (https)"
            required
          />
        )}
        <input type="hidden" name="image" value={image} />
      </fieldset>

      <label className="block space-y-1 text-sm">
        <span>Display name</span>
        <input name="name" defaultValue={user.name} required maxLength={80} className="input" />
      </label>
      <label className="block space-y-1 text-sm">
        <span>Bio</span>
        <textarea name="bio" defaultValue={user.bio} maxLength={500} rows={4} className="input" />
      </label>
      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
      {state?.ok && <p className="text-sm text-green-600">Saved.</p>}
      <button className="btn-primary" disabled={pending}>{pending ? "Saving…" : "Save"}</button>
    </form>
  );
}
