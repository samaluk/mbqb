/**
 * Copies Lexical `body` from locale rows into published version snapshots.
 *
 * The HTML→Lexical backfill updated `*_locales.body` directly. Payload serves
 * public reads from `_collection_v_locales.version_body` on the published
 * snapshot, so the storefront can stay empty while admin looks correct.
 *
 * Usage:
 *   pnpm sync:published-lexical-body
 *   pnpm sync:published-lexical-body:prod
 *   pnpm sync:published-lexical-body:prod -- --dry-run
 */
import { sql } from '@payloadcms/db-postgres'

import { loadEnvForScript } from './loadScriptEnv.js'

const collections = [
  {
    collection: 'canchas',
    localesTable: 'canchas_locales',
    parentTable: 'canchas',
    versionsLocalesTable: '_canchas_v_locales',
    versionsTable: '_canchas_v',
  },
  {
    collection: 'la-biblia-articles',
    localesTable: 'la_biblia_articles_locales',
    parentTable: 'la_biblia_articles',
    versionsLocalesTable: '_la_biblia_articles_v_locales',
    versionsTable: '_la_biblia_articles_v',
  },
  {
    collection: 'products',
    localesTable: 'products_locales',
    parentTable: 'products',
    versionsLocalesTable: '_products_v_locales',
    versionsTable: '_products_v',
  },
] as const

const locale = 'es'
const dryRun = process.argv.includes('--dry-run')

function hasLexicalContent(body: unknown): boolean {
  if (!body || typeof body !== 'object') return false

  const root = (body as { root?: { children?: unknown[] } }).root
  return Array.isArray(root?.children) && root.children.length > 0
}

async function syncCollection(
  payload: Awaited<ReturnType<typeof import('payload').getPayload>>,
  {
    collection,
    localesTable,
    parentTable,
    versionsLocalesTable,
    versionsTable,
  }: (typeof collections)[number],
) {
  const result = (await payload.db.drizzle.execute(sql.raw(`
    select distinct on (c.id)
      c.id as parent_id,
      cl.body as locale_body,
      v.id as version_id,
      vcl.id as version_locale_id,
      vcl.version_body as published_version_body
    from ${parentTable} c
    join ${localesTable} cl
      on cl._parent_id = c.id
      and cl._locale = '${locale}'
    join ${versionsTable} v
      on v.parent_id = c.id
      and v.version__status = 'published'
    join ${versionsLocalesTable} vcl
      on vcl._parent_id = v.id
      and vcl._locale = '${locale}'
    where c._status = 'published'
      and cl.body is not null
    order by c.id asc, v.updated_at desc
  `))) as {
    rows: {
      locale_body: unknown
      parent_id: number
      published_version_body: unknown
      version_id: number
      version_locale_id: number
    }[]
  }

  let skipped = 0
  let updated = 0

  for (const row of result.rows) {
    if (!hasLexicalContent(row.locale_body)) {
      skipped += 1
      continue
    }

    if (
      JSON.stringify(row.locale_body) === JSON.stringify(row.published_version_body)
    ) {
      skipped += 1
      continue
    }

    if (dryRun) {
      console.log(
        `${collection}:${row.parent_id} would sync published version ${row.version_id}`,
      )
      updated += 1
      continue
    }

    await payload.db.drizzle.execute(sql`
      update ${sql.raw(versionsLocalesTable)}
      set version_body = ${JSON.stringify(row.locale_body)}::jsonb
      where id = ${row.version_locale_id}
    `)
    updated += 1
  }

  console.log(
    `${collection}: ${updated} published version bodies ${dryRun ? 'would be ' : ''}synced, ${skipped} skipped`,
  )

  return updated
}

async function main() {
  loadEnvForScript()
  await import('../src/env.js')

  const { default: config } = await import('@payload-config')
  const { getPayload } = await import('payload')
  const payload = await getPayload({ config })
  let total = 0

  for (const entry of collections) {
    total += await syncCollection(payload, entry)
  }

  if (dryRun) {
    console.log(`Dry run complete. ${total} rows would be updated.`)
  } else {
    console.log(`Done. ${total} published version bodies synced.`)
  }

  process.exit(0)
}

void main()
