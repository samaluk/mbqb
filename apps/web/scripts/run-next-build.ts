import { execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { loadBuildEnv } from './loadScriptEnv.js'

const filename = fileURLToPath(import.meta.url)
const appDir = path.resolve(path.dirname(filename), '..')

loadBuildEnv()
await import('../src/env.js')

const nodeOptions = process.env.NODE_OPTIONS?.replaceAll('--import=tsx/esm', '').trim()

execSync('next build', {
  cwd: appDir,
  env: {
    ...process.env,
    NODE_OPTIONS: nodeOptions || '--no-deprecation --max-old-space-size=8000',
  },
  stdio: 'inherit',
})
