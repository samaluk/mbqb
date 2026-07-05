import { execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { envForPayloadCli, loadProductionEnv } from './loadScriptEnv.js'

const filename = fileURLToPath(import.meta.url)
const appDir = path.resolve(path.dirname(filename), '..')

loadProductionEnv()
await import('../src/env.js')

execSync('payload migrate', {
  cwd: appDir,
  env: envForPayloadCli(),
  stdio: 'inherit',
})
