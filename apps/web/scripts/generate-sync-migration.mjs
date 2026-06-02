import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const require = createRequire(
  path.join(
    dirname,
    '../../../node_modules/.pnpm/drizzle-kit@0.31.7/node_modules/drizzle-kit/package.json',
  ),
)
const { generateMigration, upPgSnapshot } = require('drizzle-kit/api')
const migrationsDir = path.resolve(dirname, '../src/migrations')

const latestSnapshotPath = path.join(migrationsDir, '20260602_003617_cms_home_page_video.json')
const fullSnapshot = JSON.parse(fs.readFileSync(latestSnapshotPath, 'utf8'))

const productionTables = new Set([
  'canchas',
  'canchas_locales',
  'home_page',
  'la_biblia_articles',
  'la_biblia_articles_locales',
  'media',
  'payload_migrations',
  'products',
  'products_locales',
])

const productionEnums = new Set([
  '_locales',
  'enum_canchas_access_type',
  'enum_la_biblia_articles_category',
  'enum_la_biblia_articles_difficulty',
  'enum_products_stock_status',
])

const beforeSnapshot = structuredClone(fullSnapshot)
beforeSnapshot.tables = Object.fromEntries(
  Object.entries(fullSnapshot.tables).filter(([key]) => {
    const tableName = key.replace(/^public\./, '')
    return productionTables.has(tableName)
  }),
)
beforeSnapshot.enums = Object.fromEntries(
  Object.entries(fullSnapshot.enums ?? {}).filter(([key]) => {
    const enumName = key.replace(/^public\./, '')
    return productionEnums.has(enumName)
  }),
)

let before = beforeSnapshot
let after = fullSnapshot
if (before.version < after.version) {
  before = upPgSnapshot(before)
}

const upStatements = await generateMigration(before, after)
const downStatements = await generateMigration(after, before)

if (!upStatements?.length) {
  console.error('No UP statements generated.')
  process.exit(1)
}

const formatSqlBlock = (statements) =>
  statements.map((statement) => statement.replace(/\\/g, '\\\\').replace(/`/g, '\\`')).join('\n')

const migrationName = '20260602_120000_sync_missing_payload_schema'
const migrationPath = path.join(migrationsDir, `${migrationName}.ts`)

const fileContents = `import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql\`
${formatSqlBlock(upStatements)}
  \`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql\`
${formatSqlBlock(downStatements)}
  \`)
}
`

fs.writeFileSync(migrationPath, fileContents)
console.log(`Wrote ${migrationPath}`)
console.log(`UP statements: ${upStatements.length}`)
