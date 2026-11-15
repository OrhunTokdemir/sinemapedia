#!/bin/sh
# Runs once on first DB init: create a non-superuser role for the app.
set -eu
if [ -n "${APP_DB_PASSWORD_FILE:-}" ]; then
  APP_DB_PASSWORD="$(cat "$APP_DB_PASSWORD_FILE")"
fi
: "${APP_DB_PASSWORD:?APP_DB_PASSWORD or APP_DB_PASSWORD_FILE must be set}"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -v app_user="$APP_DB_USER" -v app_pass="$APP_DB_PASSWORD" -v db="$POSTGRES_DB" <<'SQL'
CREATE ROLE :"app_user" LOGIN PASSWORD :'app_pass' NOSUPERUSER NOCREATEDB NOCREATEROLE;
-- CREATE on the database is needed because drizzle-kit runs `CREATE SCHEMA IF NOT EXISTS`,
-- which Postgres permission-checks even when the schema exists. Still no superuser/createdb/createrole.
GRANT CONNECT, CREATE ON DATABASE :"db" TO :"app_user";
GRANT USAGE, CREATE ON SCHEMA public TO :"app_user";
SQL
