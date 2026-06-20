import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { sanitizePulledEnvFile } from './loadScriptEnv.js'

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const configured = process.env.DOTENV_CONFIG_PATH ?? '.env.production.local'
const file = path.isAbsolute(configured) ? configured : path.join(appDir, configured)

sanitizePulledEnvFile(file)
