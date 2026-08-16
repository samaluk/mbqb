#!/usr/bin/env node
/**
 * Gate D — baseline freshness check.
 *
 * Regenerates every committed identity baseline to a temporary directory
 * (never touching the working tree) and compares it against the committed
 * file. This is the one-way ratchet:
 *
 *   worse                 → the identity gates (Gate B) fail
 *   better, baseline stale → this check fails (baseline must be reduced)
 *   better + baseline reduced → passes
 *
 * Exit semantics (mirrors Fallow's ladder):
 *   0 → every baseline is fresh
 *   1 → at least one baseline is stale (regenerate with `pnpm fallow:baseline:update`)
 *   2 → analyzer/config error, propagated untouched
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'

const COVERAGE = process.env.FALLOW_COVERAGE ?? 'apps/web/coverage/coverage-final.json'

// Regenerate health with the same Istanbul coverage the committed baseline was
// saved with (see scripts/fallow-env.sh); a coverage-less regeneration would
// produce different CRAP findings and fail the freshness check spuriously.
function coverageRoot() {
  const result = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' })
  if (result.status !== 0) {
    process.stderr.write('fallow: could not determine git toplevel for --coverage-root\n')
    process.exit(2)
  }
  return result.stdout.trim()
}

if (!existsSync(COVERAGE)) {
  process.stderr.write(
    `fallow: ${COVERAGE} not found — generate it with: pnpm test:unit:coverage (CI does this before fallow:ci)\n`,
  )
  process.exit(2)
}

const COMMITTED = {
  'dead-code.json': ['pnpm', ['exec', 'fallow', 'dead-code', '--save-baseline', 'CANDIDATE', '--quiet']],
  'audit-dead-code.json': ['pnpm', ['exec', 'fallow', '--save-baseline', 'CANDIDATE', '--quiet']],
  'dupes.json': ['pnpm', ['exec', 'fallow', 'dupes', '--save-baseline', 'CANDIDATE', '--quiet']],
  'health.json': [
    'pnpm',
    [
      'exec',
      'fallow',
      'health',
      '--coverage',
      COVERAGE,
      '--coverage-root',
      coverageRoot(),
      '--baseline-mode',
      'identity',
      '--save-baseline',
      'CANDIDATE',
      '--quiet',
    ],
  ],
}

const BASELINE_DIR = 'fallow-baselines'

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b)
}

function normalizeHealth(doc) {
  const normalized = { ...doc }
  delete normalized.target_keys
  delete normalized.runtime_coverage_findings
  return normalized
}

const tempDir = mkdtempSync(join(tmpdir(), 'fallow-baseline-check-'))
let stale = false
let failed = false

try {
  for (const [name, [cmd, templateArgs]] of Object.entries(COMMITTED)) {
    const candidate = join(tempDir, name)
    const args = templateArgs.map((arg) => (arg === 'CANDIDATE' ? candidate : arg))
    const result = spawnSync(cmd, args, { encoding: 'utf8' })
    const code = result.status ?? 2

    if (code === 2) {
      process.stderr.write(
        `fallow: regenerating ${name} failed with a runtime error:\n${result.stdout || result.stderr || ''}\n`,
      )
      failed = true
      break
    }

    let candidateDoc
    let committedDoc
    try {
      candidateDoc = JSON.parse(readFileSync(candidate, 'utf8'))
      committedDoc = JSON.parse(readFileSync(join(BASELINE_DIR, name), 'utf8'))
    } catch (error) {
      process.stderr.write(`fallow: could not read baseline ${name}: ${error.message}\n`)
      failed = true
      break
    }

    const a = name === 'health.json' ? normalizeHealth(candidateDoc) : candidateDoc
    const b = name === 'health.json' ? normalizeHealth(committedDoc) : committedDoc

    if (!deepEqual(a, b)) {
      stale = true
      process.stderr.write(
        `fallow: baseline is stale: ${BASELINE_DIR}/${name}. ` +
          'Regenerate after real improvements with: pnpm fallow:baseline:update\n',
      )
    }
  }
} finally {
  rmSync(tempDir, { recursive: true, force: true })
}

if (failed) {
  process.exit(2)
}
process.exit(stale ? 1 : 0)
