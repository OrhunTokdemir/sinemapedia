import Link from "next/link";
import { getUser } from "@/lib/session";
import SignOutButton from "./SignOutButton";

export default async function UserMenu() {
  const user = await getUser();
  if (!user) {
    return (
      <div className="flex gap-2">
        <Link href="/login" className="btn">Log in</Link>
        <Link href="/signup" className="btn-primary">Sign up</Link>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 text-sm">
      <Link href="/feed" className="hover:text-accent">Feed</Link>
      <Link href="/tracking" className="hover:text-accent">Tracking</Link>
      <Link href={`/u/${user.username}`} className="font-medium hover:text-accent">
        @{user.username}
      </Link>
      <Link href="/settings" className="text-muted hover:text-accent">Settings</Link>
      <SignOutButton />
    </div>
  );
}
