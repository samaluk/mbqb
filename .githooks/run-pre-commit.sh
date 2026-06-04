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

echo "pre-commit: fallow baseline check"
pnpm fallow:baseline:check

echo "pre-commit: fallow audit"
pnpm fallow:audit

echo "pre-commit: test"
pnpm --filter @mbqb/web test

echo "pre-commit: ok"
