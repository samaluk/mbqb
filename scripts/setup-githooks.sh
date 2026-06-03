#!/usr/bin/env bash
set -euo pipefail

root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "${root}" ]]; then
  echo "setup-githooks: run inside a git repository" >&2
  exit 1
fi

cd "$root"
include_path="../.githooks/mbqb.config"
current="$(git config --local --get-all include.path 2>/dev/null || true)"
if printf '%s\n' "$current" | grep -Fxq "$include_path"; then
  echo "Git hooks config already included ($include_path)"
else
  git config --local --add include.path "$include_path"
  echo "Added include.path=$include_path"
fi

echo "Configured pre-commit hooks:"
git hook list pre-commit 2>/dev/null || true
echo "Done. pre-commit runs: lint, typecheck (tsc --noEmit), test."
