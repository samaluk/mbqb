# Shared environment for coverage-aware fallow commands.
#
# Sources via `. scripts/fallow-env.sh` from package scripts so every
# health/audit run feeds the SAME Istanbul coverage evidence into CRAP
# scoring. The ratchet only stays coherent when baselines, gates, and the
# freshness check all see identical coverage input, so a missing coverage
# file is a hard, loud error (exit 2, the analyzer-error code) instead of a
# silent fallback to the static-estimate model.
#
# Deliberately does NOT set -e: callers source this file, and errexit would
# leak into them and abort on fallow's exit-1-findings semantics.

FALLOW_COVERAGE="apps/web/coverage/coverage-final.json"
export FALLOW_COVERAGE

if [ ! -f "$FALLOW_COVERAGE" ]; then
  echo "error: $FALLOW_COVERAGE not found — generate it with: pnpm test:unit:coverage" >&2
  exit 2
fi

FALLOW_COVERAGE_ROOT="$(git rev-parse --show-toplevel)"
export FALLOW_COVERAGE_ROOT
