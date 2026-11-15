"use client";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

export default function SignOutButton() {
  const router = useRouter();
  return (
    <button
      className="text-muted hover:text-accent"
      onClick={async () => {
        await signOut();
        router.push("/");
        router.refresh();
      }}
    >
      Log out
    </button>
  );
}
