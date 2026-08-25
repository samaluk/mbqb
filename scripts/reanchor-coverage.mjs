#!/usr/bin/env node
// Re-anchor Istanbul coverage keys to the current checkout root.
//
// `pnpm test:coverage` writes absolute paths into coverage-final.json. On the
// self-hosted runners each job gets a fresh work directory, so the gate job's
// checkout root differs from the test job's, and every key misses — fallow
// then scores CRAP from export-reference estimates instead of real coverage,
// and functions without a direct unit spec (e.g. loadTestEnv) breach the
// threshold. Rewriting both the keys and the inner `path` fields to the
// consuming checkout root makes the artifact producer-independent.
//
// Idempotent: entries already anchored at the current root are left alone.

import { readFileSync, writeFileSync } from 'node:fs'

const [file] = process.argv.slice(2)
if (!file) {
  console.error('usage: node scripts/reanchor-coverage.mjs <coverage-final.json>')
  process.exit(2)
}

const root = `${process.cwd().replace(/\/+$/, '')}/`
const coverage = JSON.parse(readFileSync(file, 'utf8'))

const reanchored = Object.fromEntries(
  Object.entries(coverage).map(([key, entry]) => {
    if (key.startsWith(root)) return [key, entry]
    const relative = key.slice(key.indexOf('/apps/') + 1)
    const path = 'path' in entry && !entry.path.startsWith(root)
      ? `${root}${relative}`
      : entry.path
    return [`${root}${relative}`, { ...entry, path }]
  }),
)

writeFileSync(file, `${JSON.stringify(reanchored)}\n`)
console.log(`reanchor-coverage: ${Object.keys(reanchored).length} entries anchored at ${root}`)
