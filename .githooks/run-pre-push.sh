#!/usr/bin/env bash
set -euo pipefail

root="$(git rev-parse --show-toplevel)"
cd "$root"

env_file="apps/web/.env.local"
if [[ -f "$env_file" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$env_file"
  set +a
else
  echo "pre-push: missing $env_file (run: cd apps/web && pnpm env:pull)" >&2
  exit 1
fi

echo "pre-push: typecheck"
pnpm typecheck

echo "pre-push: build"
pnpm build

echo "pre-push: ok"
