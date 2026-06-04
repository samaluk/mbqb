#!/usr/bin/env bash
# Ensure committed fallow-baselines/ match the current codebase (no ledger drift).
set -euo pipefail

root="$(git rev-parse --show-toplevel)"
cd "$root"

baseline_dir="fallow-baselines"
dead_code="${baseline_dir}/dead-code.json"
health="${baseline_dir}/health.json"
dupes="${baseline_dir}/dupes.json"

for file in "$dead_code" "$health" "$dupes"; do
  if [[ ! -f "$file" ]]; then
    echo "check-fallow-baselines: missing $file — run: pnpm fallow:baseline" >&2
    exit 1
  fi
done

tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT

save_quiet() {
  # save-baseline exits non-zero when issues exist; the file is still written.
  "$@" >/dev/null 2>&1 || true
}

save_quiet pnpm exec fallow dead-code --save-baseline "${tmpdir}/dead-code.json"
save_quiet pnpm exec fallow health --save-baseline "${tmpdir}/health.json"
save_quiet pnpm exec fallow dupes --save-baseline "${tmpdir}/dupes.json"

drift=0
compare() {
  local name="$1"
  local committed="$2"
  local fresh="$3"
  if ! diff -q "$committed" "$fresh" >/dev/null 2>&1; then
    echo "check-fallow-baselines: ${name} is out of date (codebase vs ${committed})" >&2
    drift=1
  fi
}

compare "dead-code baseline" "$dead_code" "${tmpdir}/dead-code.json"
compare "health baseline" "$health" "${tmpdir}/health.json"
compare "dupes baseline" "$dupes" "${tmpdir}/dupes.json"

if [[ "$drift" -ne 0 ]]; then
  echo "check-fallow-baselines: run pnpm fallow:baseline and commit the updated fallow-baselines/" >&2
  exit 1
fi

if ! git diff --quiet -- "$baseline_dir"; then
  echo "check-fallow-baselines: fallow-baselines/ has unstaged changes — stage them with this commit" >&2
  exit 1
fi

echo "check-fallow-baselines: ok"
