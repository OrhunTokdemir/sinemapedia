import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ActivityList from "@/components/ActivityList";
import FollowButton from "@/components/FollowButton";
import { getFollowStats, getTracking, getUserActivity, getUserByUsername, getUserRatings } from "@/lib/data";
import { getUser } from "@/lib/session";
import { img } from "@/lib/tmdb";

export async function generateMetadata({ params }) {
  return { title: `@${(await params).username}` };
}

export default async function ProfilePage({ params }) {
  const { username } = await params;
  const profile = await getUserByUsername(decodeURIComponent(username));
  if (!profile) notFound();
  const viewer = await getUser();

  const [stats, activity, ratingsList, tracking] = await Promise.all([
    getFollowStats(profile.id, viewer?.id),
    getUserActivity(profile.id, { limit: 20 }),
    getUserRatings(profile.id, 12),
    getTracking(profile.id),
  ]);
  const watching = tracking.filter((t) => t.status === "watching");

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-8">
        <header className="flex items-start gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-3xl font-bold text-accent-fg">
            {profile.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.image} alt="" className="h-full w-full object-cover" />
            ) : (
              profile.name[0]?.toUpperCase()
            )}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              {viewer && viewer.id !== profile.id && (
                <FollowButton userId={profile.id} isFollowing={stats.isFollowing} />
              )}
              {viewer?.id === profile.id && <Link href="/settings" className="btn">Edit profile</Link>}
            </div>
            <p className="text-muted">@{profile.username}</p>
            {profile.bio && <p className="whitespace-pre-line">{profile.bio}</p>}
            <p className="text-sm">
              <Link href={`/u/${profile.username}/followers`} className="hover:text-accent">
                <b>{stats.followers}</b> followers
              </Link>{" "}
              ·{" "}
              <Link href={`/u/${profile.username}/following`} className="hover:text-accent">
                <b>{stats.following}</b> following
              </Link>
            </p>
          </div>
        </header>

        <section>
          <h2 className="h-section">Recent activity</h2>
          <ActivityList items={activity} showActor={false} />
        </section>
      </div>

      <aside className="space-y-8">
        <MediaList title="Currently watching" items={watching.map((t) => ({ media: t.media }))} />
        <MediaList title="Recent ratings" items={ratingsList} />
      </aside>
    </div>
  );
}

function MediaList({ title, items }) {
  return (
    <section>
      <h2 className="h-section">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted">Nothing yet.</p>
      ) : (
        <ul className="grid grid-cols-4 gap-2">
          {items.map(({ media, score }) => (
            <li key={media.id}>
              <Link href={`/${media.type}/${media.tmdbId}`} title={media.title} className="group block">
                <div className="relative aspect-[2/3] overflow-hidden rounded border border-border bg-surface">
                  {media.posterPath && (
                    <Image src={img(media.posterPath, "w154")} alt={media.title} fill sizes="80px" className="object-cover" />
                  )}
                  {score && (
                    <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-center text-xs font-semibold text-accent">
                      ★ {score}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
