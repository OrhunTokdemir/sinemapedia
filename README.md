# Sinemapedia

An IMDb-style site with series tracking, ratings, threaded comments, following and an activity feed.

**Stack:** Next.js 16 (App Router, Cache Components) · TMDB API · PostgreSQL 17 · Drizzle ORM · Better Auth · Docker · Caddy (TLS with post-quantum hybrid key exchange)

## Secrets and configuration

Secrets are read with the Docker `NAME_FILE` convention (`src/lib/secrets.js`). If `NAME_FILE` is set, the value is read from that file; otherwise from the `NAME` env var. A missing secret throws an error at runtime rather than falling back to a default.

**1. Docker secrets (used by the containers, in dev and prod).** Files in `secrets/`, which is gitignored:

```bash
mkdir -m 700 secrets
openssl rand -base64 24 | tr -d '/+=' > secrets/postgres_password.txt
openssl rand -base64 24 | tr -d '/+=' > secrets/app_db_password.txt
openssl rand -base64 32 > secrets/better_auth_secret.txt
printf '%s' 'YOUR_TMDB_READ_ACCESS_TOKEN' > secrets/tmdb_read_token.txt   # themoviedb.org → Settings → API
chmod 600 secrets/*
```

Secrets are mounted under `/run/secrets/` and never appear in the containers' environment or in `docker inspect`. Postgres reads only `postgres_password` and `app_db_password`.

**2. `.env` (only for `npm run dev` on your machine):**

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | `postgres://sinemapedia:<contents of secrets/app_db_password.txt>@localhost:5432/sinemapedia` |
| `BETTER_AUTH_SECRET` | random 32+ chars (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | `http://localhost:3000` |
| `TMDB_READ_TOKEN` | TMDB "API Read Access Token" (the long v4 token, not the v3 key) |

**3. Non-secret Compose settings** (shell env or `.env`): `BETTER_AUTH_URL` (public `https://` URL), `SITE_ADDRESS` (domain for Caddy, default `localhost`), and optionally `POSTGRES_DB`, `POSTGRES_USER`, `APP_DB_USER`, `DB_PORT`.

## Development

```bash
npm install
docker compose up -d db     # Postgres on 127.0.0.1:5432 only (needs secrets/ from above)
npm run db:migrate          # apply migrations in ./drizzle
npm run dev                 # http://localhost:3000
```

Schema changes: edit `src/db/schema/*.js`, then `npm run db:generate` and `npm run db:migrate`. `npm run db:studio` opens Drizzle Studio.

## Production

```bash
docker compose --profile prod up -d --build
```

This starts `db`, runs the one-off `migrate` job, then starts `app` (Next.js standalone, non-root) behind `caddy`, which handles HTTPS automatically. Recent Caddy versions negotiate `X25519MLKEM768` (hybrid post-quantum) with browsers that support it. You can check this in the browser's devtools → Security tab.

## Layout

```
src/
  actions/      server actions (tracking, ratings, comments, follows, profile)
  app/          routes: /, /search, /movie/[id], /tv/[id]/season/[s]/episode/[e], /person/[id],
                /u/[username], /feed, /tracking, /login, /signup, /settings
  components/   UI (server + client components)
  db/           Drizzle client and schema
  lib/          auth, session helpers, TMDB client, data queries, up-next logic
  proxy.js      optimistic auth redirect for protected routes
```

TMDB data is cached with `'use cache'` + `cacheLife`. User data is read uncached inside `<Suspense>`, and server actions call `refresh()` after mutations.

Data and images from [TMDB](https://www.themoviedb.org). This product uses the TMDB API but is not endorsed or certified by TMDB.
