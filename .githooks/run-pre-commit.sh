#!/usr/bin/env bash
set -euo pipefail

root="$(git rev-parse --show-toplevel)"
cd "$root"

echo "pre-commit: lint"
pnpm --filter @mbqb/web lint

echo "pre-commit: typecheck"
pnpm --filter @mbqb/web exec tsc --noEmit

echo "pre-commit: test"
pnpm --filter @mbqb/web test

echo "pre-commit: ok"
