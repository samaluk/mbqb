#!/usr/bin/env node
/**
 * Builds a single squashed schema migration from the current local database.
 * Prerequisite: local DB matches production (e.g. pnpm seed:dev-from-prod).
 *
 * Usage: node scripts/build-baseline-migration.mjs
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// oxlint-disable-next-line typescript/no-unsafe-assignment, typescript/no-unsafe-call, typescript/no-unsafe-member-access
const dirname = path.dirname(fileURLToPath(import.meta.url))
// oxlint-disable-next-line typescript/no-unsafe-assignment, typescript/no-unsafe-call, typescript/no-unsafe-member-access
const appDir = path.resolve(dirname, '..')
// oxlint-disable-next-line typescript/no-unsafe-assignment, typescript/no-unsafe-call, typescript/no-unsafe-member-access
const migrationsDir = path.join(appDir, 'src/migrations')
const migrationName = '20260604_000000_baseline'
// oxlint-disable-next-line typescript/no-unsafe-assignment, typescript/no-unsafe-call, typescript/no-unsafe-member-access
const migrationPath = path.join(migrationsDir, `${migrationName}.ts`)

// oxlint-disable-next-line typescript/no-unsafe-assignment
const localPostgresUrl =
  // oxlint-disable-next-line typescript/no-unsafe-member-access
  process.env.POSTGRES_URL || 'postgres://postgres:postgres@127.0.0.1:5433/mbqb'

function dumpSchema() {
  // oxlint-disable-next-line typescript/no-unsafe-assignment, typescript/no-unsafe-call
  const docker = spawnSync(
    'docker',
    [
      'run',
      '--rm',
      '-e',
      // oxlint-disable-next-line typescript/no-unsafe-call, typescript/no-unsafe-member-access
      `POSTGRES_URL=${localPostgresUrl.replace('127.0.0.1', 'host.docker.internal')}`,
      'imresamu/postgis:17-3.5',
      'sh',
      '-c',
      'pg_dump "$POSTGRES_URL" --schema-only --no-owner --no-privileges --schema=public',
    ],
    { encoding: 'utf8' },
  )

  // oxlint-disable-next-line typescript/no-unsafe-member-access
  if (docker.status === 0 && docker.stdout) {
    // oxlint-disable-next-line typescript/no-unsafe-return, typescript/no-unsafe-member-access
    return docker.stdout
  }

  // oxlint-disable-next-line typescript/no-unsafe-assignment, typescript/no-unsafe-call
  const pgDump = spawnSync(
    'pg_dump',
    [localPostgresUrl, '--schema-only', '--no-owner', '--no-privileges', '--schema=public'],
    { encoding: 'utf8' },
  )

  // oxlint-disable-next-line typescript/no-unsafe-member-access
  if (pgDump.status !== 0) {
    // oxlint-disable-next-line typescript/no-unsafe-member-access
    console.error(pgDump.stderr || docker.stderr)
    // oxlint-disable-next-line typescript/no-unsafe-call, typescript/no-unsafe-member-access
    process.exit(1)
  }

  // oxlint-disable-next-line typescript/no-unsafe-return, typescript/no-unsafe-member-access
  return pgDump.stdout
}

function skipLine(line) {
  // oxlint-disable-next-line typescript/no-unsafe-assignment, typescript/no-unsafe-call, typescript/no-unsafe-member-access
  const trimmed = line.trim()
  if (!trimmed) return true
  // oxlint-disable-next-line typescript/no-unsafe-call, typescript/no-unsafe-member-access
  if (trimmed.startsWith('\\')) return true
  // oxlint-disable-next-line typescript/no-unsafe-call, typescript/no-unsafe-member-access
  if (trimmed.startsWith('--')) return true
  // oxlint-disable-next-line typescript/no-unsafe-call, typescript/no-unsafe-member-access
  if (trimmed.startsWith('SET ')) return true
  // oxlint-disable-next-line typescript/no-unsafe-call, typescript/no-unsafe-member-access
  if (trimmed.startsWith('SELECT pg_catalog')) return true
  // oxlint-disable-next-line typescript/no-unsafe-call, typescript/no-unsafe-member-access
  if (trimmed.startsWith('COMMENT ON ')) return true
  // oxlint-disable-next-line typescript/no-unsafe-argument
  if (/^CREATE SCHEMA public\b/i.test(trimmed)) return true
  return false
}

function sanitizeDump(raw) {
  // oxlint-disable-next-line typescript/no-unsafe-assignment, typescript/no-unsafe-call
  const body = raw
    // oxlint-disable-next-line typescript/no-unsafe-member-access
    .split('\n')
    // oxlint-disable-next-line typescript/no-unsafe-member-access
    .filter((line) => !skipLine(line))
    // oxlint-disable-next-line typescript/no-unsafe-member-access
    .join('\n')
    // oxlint-disable-next-line typescript/no-unsafe-member-access
    .trim()

  return ['CREATE EXTENSION IF NOT EXISTS postgis;', body].filter(Boolean).join('\n')
}

function escapeForTemplateLiteral(sql) {
  // oxlint-disable-next-line typescript/no-unsafe-return, typescript/no-unsafe-call, typescript/no-unsafe-member-access
  return sql.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
}

const baselineSql = sanitizeDump(dumpSchema())

if (!baselineSql.includes('payload_migrations')) {
  console.error('Dump is missing payload_migrations — is POSTGRES_URL pointed at a migrated DB?')
  // oxlint-disable-next-line typescript/no-unsafe-call, typescript/no-unsafe-member-access
  process.exit(1)
}

if (!baselineSql.includes('version_body jsonb')) {
  console.error('Dump is missing lexical body columns — run pending migrations first.')
  // oxlint-disable-next-line typescript/no-unsafe-call, typescript/no-unsafe-member-access
  process.exit(1)
}

// oxlint-disable-next-line typescript/no-unsafe-assignment
const escapedBaseline = escapeForTemplateLiteral(baselineSql)

const fileContents = `import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

const baselineSql = \`
${escapedBaseline}
\`

/**
 * Squashed schema baseline (production shape as of 2026-06-04, including Lexical body fields).
 * - Fresh DB: run via \`payload migrate:fresh\` (drops public schema, then applies this).
 * - Existing prod/local: do not re-run \`up\`; reset \`payload_migrations\` only (see scripts/reset-payload-migrations-to-baseline.sql).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  const statements = baselineSql
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean)

  for (const statement of statements) {
    await db.execute(sql.raw(\`\${statement};\`))
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql\`
    DROP SCHEMA IF EXISTS public CASCADE;
    CREATE SCHEMA public;
    GRANT ALL ON SCHEMA public TO public;
    GRANT ALL ON SCHEMA public TO postgres;
    CREATE EXTENSION IF NOT EXISTS postgis;
  \`)
}
`

// oxlint-disable-next-line typescript/no-unsafe-call, typescript/no-unsafe-member-access
fs.writeFileSync(migrationPath, fileContents)

console.log(`Wrote ${migrationPath} (${baselineSql.length} bytes of SQL)`)
