import { readFileSync } from 'node:fs'
import path from 'node:path'

import dotenv from 'dotenv'

const file = process.argv[2]

if (!file) {
  console.error('Usage: resolve-postgres-url.ts <env-file>')
  process.exit(1)
}

const resolved = path.resolve(file)
const url = dotenv.parse(readFileSync(resolved, 'utf8')).POSTGRES_URL?.trim()

if (!url) {
  console.error(`POSTGRES_URL is not set in ${resolved}`)
  process.exit(1)
}

process.stdout.write(url)
