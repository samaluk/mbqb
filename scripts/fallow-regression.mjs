#!/usr/bin/env node
/**
 * Gate C — count-based regression ratchet for dead-code.
 *
 * Wraps `fallow dead-code --fail-on-regression` because Fallow's CLI exit
 * codes cannot distinguish "analysis completed with findings" (1) from
 * "regression exceeded" (1). The regression verdict lives in the JSON
 * envelope (`regression.exceeded`), so this wrapper reads it:
 *
 *   exit 0 → analysis completed, no regression (findings may exist; they are
 *            already owned by the identity baselines in Gate B)
 *   exit 1 → regression exceeded the committed baseline
 *   exit 2 → analyzer/config error, propagated untouched
 */
import { spawnSync } from 'node:child_process'
import process from 'node:process'

const REGRESSION_BASELINE = 'fallow-baselines/regression-dead-code.json'

const result = spawnSync(
  'pnpm',
  [
    'exec',
    'fallow',
    'dead-code',
    '--fail-on-regression',
    '--regression-baseline',
    REGRESSION_BASELINE,
    '--format',
    'json',
    '--quiet',
  ],
  { encoding: 'utf8' },
)

const code = result.status ?? 2

if (code === 2) {
  process.stderr.write(result.stdout || result.stderr || 'fallow dead-code failed with a runtime error\n')
  process.exit(2)
}

let exceeded = false
try {
  const doc = JSON.parse(result.stdout)
  exceeded = doc?.regression?.exceeded === true
} catch {
  process.stderr.write(result.stderr || 'failed to parse fallow regression output\n')
}

if (exceeded) {
  process.stderr.write(
    `fallow: dead-code issue counts exceeded the committed regression baseline (${REGRESSION_BASELINE}). ` +
      'Fix the regressions, or after a legitimate count increase regenerate with: pnpm fallow:baseline:update\n',
  )
  process.exit(1)
}

process.exit(0)
