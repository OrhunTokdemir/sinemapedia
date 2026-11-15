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
GRANT CONNECT ON DATABASE :"db" TO :"app_user";
GRANT USAGE, CREATE ON SCHEMA public TO :"app_user";
SQL
