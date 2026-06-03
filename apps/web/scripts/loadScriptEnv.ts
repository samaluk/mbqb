import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'

const filename = fileURLToPath(import.meta.url)
const scriptsDir = path.dirname(filename)
const defaultProductionEnvPath = path.resolve(scriptsDir, '../../../.vercel/.env.production.local')

export const loadScriptEnv = () => {
  const envPath =
    process.env.DOTENV_CONFIG_PATH ||
    (process.env.DATABASE_URL?.trim()
      ? undefined
      : existsSync(defaultProductionEnvPath)
        ? defaultProductionEnvPath
        : undefined)

  if (envPath) {
    dotenv.config({ path: envPath })
  } else {
    dotenv.config()
  }

  if (process.env.DATABASE_URL_UNPOOLED?.trim()) {
    process.env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED
  }

  const localEnvPath = path.resolve(scriptsDir, '../.env')
  if (existsSync(localEnvPath)) {
    if (envPath) {
      const localEnv = dotenv.parse(readFileSync(localEnvPath))
      if (!process.env.PAYLOAD_SECRET?.trim() && localEnv.PAYLOAD_SECRET?.trim()) {
        process.env.PAYLOAD_SECRET = localEnv.PAYLOAD_SECRET
      }
    } else {
      dotenv.config({ path: localEnvPath, override: true })
    }
  }
}
