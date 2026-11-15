"use client";
import { useActionState } from "react";
import { updateProfile } from "@/actions/profile";

export default function SettingsForm({ user }) {
  const [state, action, pending] = useActionState(updateProfile, null);
  return (
    <form action={action} className="card space-y-4 p-6">
      <p className="text-sm text-muted">Username: @{user.username}</p>
      <label className="block space-y-1 text-sm">
        <span>Display name</span>
        <input name="name" defaultValue={user.name} required maxLength={80} className="input" />
      </label>
      <label className="block space-y-1 text-sm">
        <span>Bio</span>
        <textarea name="bio" defaultValue={user.bio} maxLength={500} rows={4} className="input" />
      </label>
      <label className="block space-y-1 text-sm">
        <span>Avatar URL (https)</span>
        <input name="image" type="url" defaultValue={user.image} className="input" placeholder="https://…" />
      </label>
      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
      {state?.ok && <p className="text-sm text-green-600">Saved.</p>}
      <button className="btn-primary" disabled={pending}>{pending ? "Saving…" : "Save"}</button>
    </form>
  );
}
