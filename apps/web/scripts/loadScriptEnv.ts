import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const requireEnvFile = (relativePath: string, pullHint: string) => {
  const file = path.join(appDir, relativePath)
  if (!existsSync(file)) {
    throw new Error(`Missing ${file}. Run: ${pullHint}`)
  }
  dotenv.config({ path: file })
}

/** Local dev / tests: Vercel Development env → `pnpm env:pull` → `.env.local`. */
export const loadLocalEnv = () =>
  requireEnvFile('.env.local', 'cd apps/web && pnpm env:pull')

/** Production DB scripts: `pnpm env:pull:production` → `.env.production.local`. */
export const loadProductionEnv = () => {
  const configured = process.env.DOTENV_CONFIG_PATH ?? '.env.production.local'
  const file = path.isAbsolute(configured) ? configured : path.join(appDir, configured)

  if (existsSync(file)) {
    dotenv.config({ path: file })
  } else if (process.env.VERCEL || process.env.POSTGRES_URL?.trim()) {
    // Vercel (and similar CI) inject env at build time — no pulled file on disk.
  } else {
    throw new Error(`Missing ${file}. Run: cd apps/web && pnpm env:pull:production`)
  }
}

/** Payload/DB scripts: production env when `NODE_ENV=production`, else local. */
export const loadEnvForScript = () => {
  if (process.env.NODE_ENV === 'production') loadProductionEnv()
  else loadLocalEnv()
}
