/**
 * Builds a single squashed schema migration from the current local database.
 * Prerequisite: local DB matches production (e.g. pnpm seed:dev-from-prod).
 *
 * Usage: pnpm migrate:baseline
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const appDir = path.resolve(dirname, '..')
const migrationsDir = path.join(appDir, 'src/migrations')
const migrationName = '20260604_000000_baseline'
const migrationPath = path.join(migrationsDir, `${migrationName}.ts`)

const localPostgresUrl =
  process.env.POSTGRES_URL || 'postgres://postgres:postgres@127.0.0.1:5433/mbqb'

function dumpSchema(): string {
  const docker = spawnSync(
    'docker',
    [
      'run',
      '--rm',
      '-e',
      `POSTGRES_URL=${localPostgresUrl.replace('127.0.0.1', 'host.docker.internal')}`,
      'imresamu/postgis:17-3.5',
      'sh',
      '-c',
      'pg_dump "$POSTGRES_URL" --schema-only --no-owner --no-privileges --schema=public',
    ],
    { encoding: 'utf8' },
  )

  if (docker.status === 0 && docker.stdout) {
    return docker.stdout
  }

  const pgDump = spawnSync(
    'pg_dump',
    [localPostgresUrl, '--schema-only', '--no-owner', '--no-privileges', '--schema=public'],
    { encoding: 'utf8' },
  )

  if (pgDump.status !== 0) {
    console.error(pgDump.stderr || docker.stderr)
    process.exit(1)
  }

  return pgDump.stdout
}

function skipLine(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed) return true
  if (trimmed.startsWith('\\')) return true
  if (trimmed.startsWith('--')) return true
  if (trimmed.startsWith('SET ')) return true
  if (trimmed.startsWith('SELECT pg_catalog')) return true
  if (trimmed.startsWith('COMMENT ON ')) return true
  if (/^CREATE SCHEMA public\b/i.test(trimmed)) return true
  return false
}

function sanitizeDump(raw: string): string {
  const body = raw
    .split('\n')
    .filter((line) => !skipLine(line))
    .join('\n')
    .trim()

  return ['CREATE EXTENSION IF NOT EXISTS postgis;', body].filter(Boolean).join('\n')
}

function escapeForTemplateLiteral(sql: string): string {
  return sql.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
}

const baselineSql = sanitizeDump(dumpSchema())

if (!baselineSql.includes('payload_migrations')) {
  console.error('Dump is missing payload_migrations — is POSTGRES_URL pointed at a migrated DB?')
  process.exit(1)
}

if (!baselineSql.includes('version_body jsonb')) {
  console.error('Dump is missing lexical body columns — run pending migrations first.')
  process.exit(1)
}

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

fs.writeFileSync(migrationPath, fileContents)

console.log(`Wrote ${migrationPath} (${baselineSql.length} bytes of SQL)`)
