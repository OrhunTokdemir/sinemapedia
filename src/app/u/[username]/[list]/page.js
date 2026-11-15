import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFollowList, getUserByUsername } from "@/lib/data";
import Avatar from "@/components/Avatar";

export async function generateMetadata({ params }) {
  const { username, list } = await params;
  return { title: `@${username} · ${list}` };
}

export default function Page({ params }) {
  return (
    <Suspense fallback={<div className="card mx-auto h-40 max-w-xl animate-pulse" />}>
      <FollowListPage params={params} />
    </Suspense>
  );
}

async function FollowListPage({ params }) {
  const { username, list } = await params;
  if (list !== "followers" && list !== "following") notFound();
  const profile = await getUserByUsername(decodeURIComponent(username));
  if (!profile) notFound();
  const users = await getFollowList(profile.id, list);

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-sm text-muted">
        <Link href={`/u/${profile.username}`} className="hover:text-accent-ink">@{profile.username}</Link>
      </p>
      <h1 className="mb-4 text-2xl font-bold capitalize">{list}</h1>
      {users.length === 0 ? (
        <p className="text-sm text-muted">No one yet.</p>
      ) : (
        <ul className="space-y-2">
          {users.map((u) => (
            <li key={u.id}>
              <Link href={`/u/${u.username}`} className="card flex items-center gap-3 p-3 hover:border-accent">
                <Avatar user={u} size={36} />
                <span>
                  <span className="font-medium">{u.name}</span>{" "}
                  <span className="text-sm text-muted">@{u.username}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
