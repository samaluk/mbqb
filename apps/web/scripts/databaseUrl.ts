import { readFileSync } from 'node:fs'

import dotenv from 'dotenv'

export type DatabaseUrlTarget = 'local' | 'production'

const pick = (env: Record<string, string | undefined>, keys: string[]) => {
  for (const key of keys) {
    const value = env[key]?.trim()
    if (value) return value
  }
  return ''
}

export const databaseUrlFromEnv = (
  env: Record<string, string | undefined>,
  target: DatabaseUrlTarget,
) => {
  if (target === 'local') {
    return pick(env, ['DATABASE_URL'])
  }

  return pick(env, [
    'DATABASE_URL_UNPOOLED',
    'DATABASE_URL',
    'POSTGRES_URL_NON_POOLING',
    'POSTGRES_URL',
  ])
}

export const databaseUrlFromEnvFile = (filePath: string, target: DatabaseUrlTarget) => {
  const url = databaseUrlFromEnv(dotenv.parse(readFileSync(filePath, 'utf8')), target)

  if (!url) {
    if (target === 'local') {
      throw new Error(`DATABASE_URL is not set in ${filePath}`)
    }

    throw new Error(
      `No production database URL in ${filePath} (expected DATABASE_URL, DATABASE_URL_UNPOOLED, or POSTGRES_URL)`,
    )
  }

  return url
}

export const applyProductionDatabaseUrl = () => {
  const url = databaseUrlFromEnv(process.env, 'production')

  if (url) {
    process.env.DATABASE_URL = url
  }
}
