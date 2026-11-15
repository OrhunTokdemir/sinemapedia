import { Suspense } from "react";
import { requireUser } from "@/lib/session";
import SettingsForm from "@/components/SettingsForm";
import { defaultAvatarFor } from "@/lib/avatars";

export const metadata = { title: "Settings" };

export default function Page() {
  return (
    <Suspense fallback={<div className="card mx-auto h-60 max-w-lg animate-pulse" />}>
      <SettingsPage />
    </Suspense>
  );
}

async function SettingsPage() {
  const user = await requireUser();
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-4 text-2xl font-bold">Profile settings</h1>
      <SettingsForm
        user={{ name: user.name, bio: user.bio ?? "", image: user.image ?? "", username: user.username, autoAvatar: defaultAvatarFor(user.id) }}
      />
    </div>
  );
}
