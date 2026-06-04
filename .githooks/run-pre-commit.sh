#!/usr/bin/env bash
set -euo pipefail

root="$(git rev-parse --show-toplevel)"
cd "$root"

echo "pre-commit: lint"
pnpm --filter @mbqb/web lint

echo "pre-commit: typecheck"
pnpm --filter @mbqb/web exec tsc --noEmit

echo "pre-commit: fallow baseline check"
pnpm fallow:baseline:check

echo "pre-commit: fallow audit"
pnpm fallow:audit

echo "pre-commit: test"
pnpm --filter @mbqb/web test

echo "pre-commit: ok"
