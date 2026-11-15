import { requireUser } from "@/lib/session";
import SettingsForm from "@/components/SettingsForm";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser();
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-4 text-2xl font-bold">Profile settings</h1>
      <SettingsForm user={{ name: user.name, bio: user.bio ?? "", image: user.image ?? "", username: user.username }} />
    </div>
  );
}
