import { existsSync, readFileSync, renameSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const target = process.argv[2]
const isProductionTarget = target === 'production'
const envFile = path.join(appDir, isProductionTarget ? '.env.production.local' : '.env.local')

if (existsSync(envFile)) {
  const parsed = dotenv.parse(readFileSync(envFile))
  for (const [key, value] of Object.entries(parsed)) {
    if (value.trim() !== '' && !process.env[key]?.trim()) {
      process.env[key] = value
    }
  }
} else if (!process.env.CI && !process.env.VERCEL && !process.env.POSTGRES_URL?.trim()) {
  const pullCommand = isProductionTarget ? 'pnpm env:pull:production' : 'pnpm env:pull'
  throw new Error(`Missing ${envFile}. Run: cd apps/web && ${pullCommand}`)
}

process.env.PAYLOAD_SECRET ||= 'development-secret'
process.env.PREVIEW_SECRET ||= 'development-preview-secret'
process.env.NEXT_PUBLIC_SERVER_URL ||= 'http://localhost:3000'

const nextBin = path.join(appDir, 'node_modules/next/dist/bin/next')
const maskedProductionFiles = []

if (!isProductionTarget) {
  for (const name of ['.env.production.local', '.env.production']) {
    const file = path.join(appDir, name)
    if (!existsSync(file)) continue

    const masked = `${file}.mbqb-local-build`
    renameSync(file, masked)
    maskedProductionFiles.push([file, masked])
  }
}

try {
  const result = spawnSync(process.execPath, [nextBin, 'build'], {
    cwd: appDir,
    env: process.env,
    stdio: 'inherit',
  })

  if (result.error) throw result.error
  if (result.status !== 0) process.exitCode = result.status ?? 1
} finally {
  for (const [file, masked] of maskedProductionFiles) {
    renameSync(masked, file)
  }
}
