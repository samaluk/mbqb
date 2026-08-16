#!/bin/sh
# Regenerate every committed Fallow baseline coherently.
#
# Run this ONLY after genuine improvements (real fixes, config changes, or a
# deliberate Fallow upgrade). It never hides analyzer errors: any command that
# exits with code 2 (a real tool/config error) aborts the run; exit 1 (findings
# exist, which is exactly what a baseline captures) is expected and preserved.
set -u

run() {
  "$@"
  code=$?
  if [ "$code" -ge 2 ]; then
    echo "error: command failed with exit $code: $*" >&2
    exit 2
  fi
  return 0
}

# Coverage must be generated before the health baseline so the committed
# baseline and every CI/local gate compare against identical CRAP evidence.
. scripts/fallow-env.sh

run pnpm exec fallow dead-code --save-baseline fallow-baselines/dead-code.json --quiet
# The audit dead-code baseline must carry audit's semantic mode (the combined
# run requests the extra `type-coupling` capability), otherwise `fallow audit`
# rejects it as identity-incompatible.
run pnpm exec fallow --save-baseline fallow-baselines/audit-dead-code.json --quiet
run pnpm exec fallow dupes --save-baseline fallow-baselines/dupes.json --quiet
run pnpm exec fallow health --baseline-mode identity --save-baseline fallow-baselines/health.json --quiet
run pnpm exec fallow dead-code --save-regression-baseline fallow-baselines/regression-dead-code.json --quiet

echo "Baselines regenerated in fallow-baselines/ (review and commit them)."
