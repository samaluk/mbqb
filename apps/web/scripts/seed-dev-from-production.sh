#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
app_dir="$(cd "${script_dir}/.." && pwd)"
repo_root="$(cd "${app_dir}/../.." && pwd)"
default_production_env="${repo_root}/.vercel/.env.production.local"
production_env="${DOTENV_CONFIG_PATH:-${default_production_env}}"
local_env="${app_dir}/.env"
dump_file="$(mktemp -t mbqb-prod-seed.XXXXXX.sql)"

cleanup() {
  rm -f "${dump_file}"
}

trap cleanup EXIT

if [[ ! -f "${local_env}" ]]; then
  echo "Missing ${local_env}. Copy .env.example and configure local DATABASE_URL." >&2
  exit 1
fi

if [[ ! -f "${production_env}" ]]; then
  echo "Missing production env at ${production_env}." >&2
  echo "Run: cd apps/web && vercel env pull ../../.vercel/.env.production.local --environment=production" >&2
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql is required. Install PostgreSQL client tools." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "${local_env}"
local_database_url="${DATABASE_URL:-}"

if [[ -z "${local_database_url}" ]]; then
  echo "DATABASE_URL is not set in ${local_env}." >&2
  exit 1
fi

# shellcheck disable=SC1090
source "${production_env}"
production_database_url="${DATABASE_URL_UNPOOLED:-${DATABASE_URL:-}}"
set +a

if [[ -z "${production_database_url}" ]]; then
  echo "DATABASE_URL is not set in ${production_env}." >&2
  exit 1
fi

if [[ "${local_database_url}" == "${production_database_url}" ]]; then
  echo "Refusing to seed: local and production DATABASE_URL are identical." >&2
  exit 1
fi

dump_production() {
  if command -v pg_dump >/dev/null 2>&1; then
    if pg_dump "${production_database_url}" \
      --format=plain \
      --no-owner \
      --no-privileges \
      --clean \
      --if-exists \
      > "${dump_file}" 2>/dev/null; then
      return
    fi
  fi

  if ! command -v docker >/dev/null 2>&1; then
    echo "Need pg_dump 17+ or Docker to dump production (local pg_dump version may be too old)." >&2
    exit 1
  fi

  docker run --rm -e "DATABASE_URL=${production_database_url}" imresamu/postgis:17-3.5 \
    sh -c 'pg_dump "$DATABASE_URL" --format=plain --no-owner --no-privileges --clean --if-exists' \
    > "${dump_file}"
}

wait_for_local_postgres() {
  for _ in $(seq 1 30); do
    if psql "${local_database_url}" -v ON_ERROR_STOP=1 -c 'SELECT 1' >/dev/null 2>&1; then
      return
    fi
    sleep 1
  done

  echo "Local database is not reachable at ${local_database_url}." >&2
  echo "Start it with: cd apps/web && docker compose up -d postgres" >&2
  exit 1
}

echo "Dumping production database..."
dump_production

wait_for_local_postgres

echo "Resetting local database..."
psql "${local_database_url}" -v ON_ERROR_STOP=1 -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

echo "Restoring production snapshot into local database..."
grep -v 'transaction_timeout' "${dump_file}" | psql "${local_database_url}" -v ON_ERROR_STOP=1

echo "Applying pending Payload migrations locally..."
(
  cd "${app_dir}"
  set -a
  # shellcheck disable=SC1090
  source "${local_env}"
  set +a
  NODE_ENV=production NODE_OPTIONS="--no-deprecation" \
    printf 'y\n' | npx payload migrate
)

echo "Local database now mirrors production content and schema migrations."
