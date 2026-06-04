import path from 'node:path'

import {
  databaseUrlFromEnvFile,
  type DatabaseUrlTarget,
} from './databaseUrl.js'

const file = process.argv[2]
const target = process.argv[3] as DatabaseUrlTarget | undefined

if (!file || (target !== 'local' && target !== 'production')) {
  console.error('Usage: resolve-database-url.ts <env-file> <local|production>')
  process.exit(1)
}

process.stdout.write(databaseUrlFromEnvFile(path.resolve(file), target))
