import Link from "next/link";
import ActivityList from "@/components/ActivityList";
import { getFeed } from "@/lib/data";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Feed" };

export default async function FeedPage({ searchParams }) {
  const user = await requireUser();
  const { before } = await searchParams;
  const cursor = Number(before) || undefined;
  const items = await getFeed(user.id, { cursor, limit: 30 });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold">Feed</h1>
      {items.length === 0 && !cursor ? (
        <p className="card p-4 text-sm text-muted">
          Nothing here yet. Follow people from their profile pages to see what they watch, rate and discuss.
        </p>
      ) : (
        <ActivityList items={items} />
      )}
      {items.length === 30 && (
        <Link href={`/feed?before=${items.at(-1).id}`} className="btn mt-4">Older</Link>
      )}
    </div>
  );
}
