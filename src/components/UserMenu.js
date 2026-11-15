import Link from "next/link";
import { getUser } from "@/lib/session";
import { avatarSrc } from "@/lib/avatars";
import AccountMenu from "./AccountMenu";
import ThemeToggle from "./ThemeToggle";

export default async function UserMenu() {
  const user = await getUser();
  if (!user) {
    return (
      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
        <Link href="/login" className="btn">Log in</Link>
        <Link href="/signup" className="btn-primary hidden sm:inline-flex">Sign up</Link>
      </div>
    );
  }
  return (
    <div className="flex shrink-0 items-center gap-5 text-sm">
      <Link href="/feed" className="hidden font-medium text-muted hover:text-foreground md:block">Feed</Link>
      <Link href="/tracking" className="hidden font-medium text-muted hover:text-foreground md:block">Tracking</Link>
      <AccountMenu user={{ name: user.name, username: user.username, image: avatarSrc(user) }} />
    </div>
  );
}
