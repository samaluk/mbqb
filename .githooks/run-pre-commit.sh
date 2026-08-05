#!/usr/bin/env bash
set -euo pipefail

root="$(git rev-parse --show-toplevel)"
cd "$root"

echo "pre-commit: lint"
pnpm run check:lint

echo "pre-commit: format"
pnpm format:check

echo "pre-commit: typecheck"
pnpm typecheck

echo "pre-commit: fallow"
pnpm fallow:ci

echo "pre-commit: test"
pnpm --filter @mbqb/web test

echo "pre-commit: ok"
