import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** Vercel sensitive production vars pull as `=""` — treat those as unset. */
const loadDotenvFileSkipEmpty = (file: string) => {
  const parsed = dotenv.parse(readFileSync(file))
  for (const [key, value] of Object.entries(parsed)) {
    if (value.trim() !== '' && !process.env[key]?.trim()) {
      process.env[key] = value
    }
  }
}

const applyBuildDefaults = () => {
  if (!process.env.PAYLOAD_SECRET?.trim()) {
    process.env.PAYLOAD_SECRET = 'development-secret'
  }
  if (!process.env.PREVIEW_SECRET?.trim()) {
    process.env.PREVIEW_SECRET = 'development-preview-secret'
  }
  if (!process.env.NEXT_PUBLIC_SERVER_URL?.trim()) {
    process.env.NEXT_PUBLIC_SERVER_URL = 'http://localhost:3000'
  }
}

/** Fixture seeding is opt-in: CI sets E2E_SEED_FIXTURES=1. */
export const isE2eFixtureSeedEnabled = (): boolean => process.env.E2E_SEED_FIXTURES === '1'

const requireEnvFile = (relativePath: string, pullHint: string) => {
  const file = path.join(appDir, relativePath)
  if (!existsSync(file)) {
    throw new Error(`Missing ${file}. Run: ${pullHint}`)
  }
  loadDotenvFileSkipEmpty(file)
}

/** Vercel sensitive vars pull as `KEY=""` — strip so they do not override `.env.local`. */
export const sanitizePulledEnvFile = (file: string) => {
  if (!existsSync(file)) return

  const content = readFileSync(file, 'utf8')
  const sanitized = content
    .split('\n')
    .filter((line) => {
      const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line)
      if (!match) return true
      const value = match[2]?.trim()
      return value !== '""' && value !== "''" && value !== ''
    })
    .join('\n')

  if (sanitized !== content) {
    writeFileSync(file, sanitized)
  }
}

/** Local dev: Vercel Development env → `pnpm env:pull` → `.env.local`. */
const loadLocalEnv = () => requireEnvFile('.env.local', 'cd apps/web && pnpm env:pull')

/** Local build/migrate and CI: `.env.local` or injected env — never production pull. */
export const loadBuildEnv = () => {
  if (process.env.VERCEL) {
    applyBuildDefaults()
    return
  }

  const localFile = path.join(appDir, '.env.local')
  if (existsSync(localFile)) {
    loadDotenvFileSkipEmpty(localFile)
    applyBuildDefaults()
    return
  }

  if (process.env.CI || process.env.POSTGRES_URL?.trim()) {
    applyBuildDefaults()
    return
  }

  throw new Error(`Missing ${localFile}. Run: cd apps/web && pnpm env:pull`)
}

/** Vitest / Playwright: `.env.local` locally; in CI use workflow-injected env. */
export const loadTestEnv = () => {
  const localFile = path.join(appDir, '.env.local')
  if (existsSync(localFile)) {
    loadDotenvFileSkipEmpty(localFile)
    return
  }
  if (process.env.CI || process.env.POSTGRES_URL?.trim() || process.env.PAYLOAD_SECRET?.trim()) {
    return
  }
  throw new Error(`Missing ${localFile}. Run: cd apps/web && pnpm env:pull`)
}

/** Production DB scripts only: `pnpm env:pull:production` → `.env.production.local`. */
export const loadProductionEnv = () => {
  const configured = process.env.DOTENV_CONFIG_PATH ?? '.env.production.local'
  const file = path.isAbsolute(configured) ? configured : path.join(appDir, configured)

  if (existsSync(file)) {
    sanitizePulledEnvFile(file)
    loadDotenvFileSkipEmpty(file)
  } else if (process.env.VERCEL || process.env.POSTGRES_URL?.trim()) {
    // Vercel injects env at build/deploy time — no pulled file on disk.
  } else {
    throw new Error(`Missing ${file}. Run: cd apps/web && pnpm env:pull:production`)
  }
}

/** Payload/DB scripts: production env when `NODE_ENV=production`, else local. */
export const loadEnvForScript = () => {
  if (process.env.NODE_ENV === 'production') loadProductionEnv()
  else loadLocalEnv()
}

/** Payload CLI loads tsx itself; inheriting `--import=tsx/esm` breaks migrate on 3.85.2+. */
export const envForPayloadCli = (): NodeJS.ProcessEnv => {
  const env = { ...process.env }
  const nodeOptions = env.NODE_OPTIONS?.trim()

  if (!nodeOptions) return env

  const sanitized = nodeOptions
    .replace(/\s*--import=tsx\/esm\b/g, '')
    .replace(/\s*--import\s+tsx\/esm\b/g, '')
    .trim()

  if (sanitized) env.NODE_OPTIONS = sanitized
  else delete env.NODE_OPTIONS

  return env
}
