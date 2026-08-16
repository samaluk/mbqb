#!/usr/bin/env node
/**
 * Security gate — verifier-filtered survivor ratchet.
 *
 * Runs `fallow security` (deterministic candidates), joins them with the
 * committed verifier verdicts (`fallow-baselines/security-verdicts.json`),
 * and fails when any candidate survives verification, needs human review, or
 * has no verdict at all. New candidates introduced by a change are
 * unverdicted until a verifier dispositions them — that is the ratchet.
 *
 * Exit semantics:
 *   0 → every candidate dispositioned; no survivors; no human-review rows
 *   1 → gate failure (survivors / needs-human-review / unverdicted candidates)
 *   2 → analyzer or config error, propagated untouched
 */
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'

const VERDICTS = 'fallow-baselines/security-verdicts.json'

const tempDir = mkdtempSync(join(tmpdir(), 'fallow-security-gate-'))
let code = 0
try {
  const candidatesFile = join(tempDir, 'candidates.json')
  const candidates = spawnSync(
    'pnpm',
    ['exec', 'fallow', 'security', '--format', 'json', '--surface', '--quiet'],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  )
  if (candidates.status === 2) {
    process.stderr.write(
      `fallow: security analysis failed:\n${candidates.stdout || candidates.stderr || ''}\n`,
    )
    process.exit(2)
  }
  writeFileSync(candidatesFile, candidates.stdout)

  const survivors = spawnSync(
    'pnpm',
    [
      'exec',
      'fallow',
      'security',
      'survivors',
      '--candidates',
      candidatesFile,
      '--verdicts',
      VERDICTS,
      '--require-verdict-for-each-candidate',
      '--format',
      'json',
      '--quiet',
    ],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  )
  const status = survivors.status ?? 2

  if (status === 2) {
    const envelope = parseJson(survivors.stdout)
    if (envelope?.message?.includes('missing verdicts')) {
      process.stderr.write(
        `fallow: security gate failed — candidates without a verifier verdict. ` +
          `Disposition each new candidate in ${VERDICTS} (see docs/fallow.md §7):\n${survivors.stdout}\n`,
      )
      process.exit(1)
    }
    process.stderr.write(
      `fallow: security survivors failed with a runtime error:\n${survivors.stdout || survivors.stderr || ''}\n`,
    )
    process.exit(2)
  }

  const doc = parseJson(survivors.stdout)
  if (!doc) {
    process.stderr.write(`fallow: could not parse security survivors output:\n${survivors.stdout || ''}\n`)
    process.exit(2)
  }

  const summary = doc.summary ?? {}
  const survivorsCount = summary.survivors ?? 0
  const humanReviewCount = summary.needs_human_review ?? 0

  if (survivorsCount > 0 || humanReviewCount > 0) {
    process.stderr.write(
      `fallow: security gate failed — ${survivorsCount} survivor(s), ${humanReviewCount} ` +
        `needs-human-review. A verifier must disposition them in ${VERDICTS} before merge.\n`,
    )
    process.exit(1)
  }

  process.exit(0)
} finally {
  rmSync(tempDir, { recursive: true, force: true })
}

function parseJson(raw) {
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}
