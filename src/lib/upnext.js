import "server-only";
import { getSeason, getShow } from "./tmdb";

const today = () => new Date().toISOString().slice(0, 10);

/**
 * Next unwatched aired episode after the user's furthest watched episode.
 * Returns { season, episode, name, airDate } or null when caught up.
 */
export async function nextEpisode(tmdbId, last) {
  const show = await getShow(tmdbId);
  if (!show) return null;
  const seasons = show.seasons
    .filter((s) => s.season_number > 0 && s.episode_count > 0)
    .map((s) => s.season_number)
    .sort((a, b) => a - b);

  let season = last?.season || seasons[0];
  let after = last?.season ? last.episode : 0;

  for (const s of seasons.filter((n) => n >= season)) {
    const data = await getSeason(tmdbId, s);
    const ep = data?.episodes?.find((e) => e.episode_number > (s === season ? after : 0));
    if (ep) {
      if (!ep.air_date || ep.air_date > today()) return null; // caught up, next not aired
      return { season: s, episode: ep.episode_number, name: ep.name, airDate: ep.air_date };
    }
  }
  return null;
}

/** Progress for a show: watched count vs aired episodes. */
export async function showProgress(tmdbId, watchedCount) {
  const show = await getShow(tmdbId);
  if (!show) return null;
  const lastAired = show.last_episode_to_air;
  let aired = show.number_of_episodes ?? 0;
  if (lastAired && show.next_episode_to_air) {
    // Count aired regular-season episodes up to the last aired one.
    aired = show.seasons
      .filter((s) => s.season_number > 0 && s.season_number < lastAired.season_number)
      .reduce((sum, s) => sum + s.episode_count, 0) + lastAired.episode_number;
  }
  return { aired, watched: Math.min(watchedCount, aired), pct: aired ? Math.round((Math.min(watchedCount, aired) / aired) * 100) : 0 };
}
