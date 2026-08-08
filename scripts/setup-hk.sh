#!/usr/bin/env bash
set -euo pipefail

root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "${root}" ]]; then
  echo "setup-hk: run inside a git repository" >&2
  exit 1
fi
cd "$root"

if ! command -v hk >/dev/null 2>&1; then
  echo "setup-hk: hk not found — install it first: brew install hk (or: cargo install hk)" >&2
  exit 1
fi

# One-time per-repo hook install (Git 2.54+ writes config-based hooks).
# Prefer the one-time global alternative: hk install --global (silent no-op in
# repos without an hk.pkl, so new clones of this repo just work).
hk install
hk validate

echo "Installed hooks:"
git hook list pre-commit
git hook list pre-push
echo "Done. pre-commit auto-fixes oxlint/oxfmt on staged files, then runs typecheck, fallow gates, unit tests."
echo "Done. pre-push runs typecheck and a local build (needs apps/web/.env.local: cd apps/web && pnpm env:pull)."
echo "Full fast suite on demand: hk check (add --all for every tracked file); autofix with hk fix."
