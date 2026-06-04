import { execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { loadTestEnv } from './loadScriptEnv.js'

const filename = fileURLToPath(import.meta.url)
const appDir = path.resolve(path.dirname(filename), '..')

loadTestEnv()

const testPostgresUrl = process.env.TEST_POSTGRES_URL?.trim()
if (!testPostgresUrl) {
  throw new Error(
    'TEST_POSTGRES_URL is required. Integration tests use an isolated database; create it and set TEST_POSTGRES_URL before migrate:test.',
  )
}

process.env.POSTGRES_URL = testPostgresUrl

if (!process.env.PAYLOAD_SECRET?.trim()) {
  process.env.PAYLOAD_SECRET = 'development-secret'
}

await import('../src/env.js')

execSync('payload migrate', {
  cwd: appDir,
  env: process.env,
  stdio: 'inherit',
})
