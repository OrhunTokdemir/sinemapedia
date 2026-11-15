// Site-wide facts used by the footer, metadata and the KVKK page.
export const SITE = {
  name: "Sinemapedia",
  author: "OrhunTokdemir",
  authorUrl: "https://github.com/OrhunTokdemir",
  createdAt: "2026-11-14", // first commit
  license: "MIT",
  licenseUrl: "https://github.com/OrhunTokdemir/sinemapedia/blob/main/LICENSE",
  kvkkUpdatedAt: "2026-11-15",
};

/** "14 November 2026" style date (fixed locale, so server and client render the same). */
export function formatDate(iso, locale = "en-GB") {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${iso}T00:00:00Z`),
  );
}

/** KVKK contact address, from the KVKK_CONTACT_EMAIL env var (read at request time). */
export function kvkkContactEmail() {
  return process.env.KVKK_CONTACT_EMAIL?.trim() || null;
}
