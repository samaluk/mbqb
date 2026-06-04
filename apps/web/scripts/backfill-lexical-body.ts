import { sql } from '@payloadcms/db-postgres'
import { createHash } from 'crypto'
import path from 'path'
import { getPayload, type Payload } from 'payload'
import { inspect } from 'util'

import {
  canConvertHTMLToLexicalBody,
  convertHTMLToLexicalBody,
} from '@/lib/convertHTMLToLexicalBody'

import { loadEnvForScript } from './loadScriptEnv.js'

type BodyCollection = 'canchas' | 'la-biblia-articles' | 'products'

const collections: BodyCollection[] = ['canchas', 'la-biblia-articles', 'products']
const locale = 'es'
const force = process.argv.includes('--force')
const legacyImageBaseUrl = process.env.LEGACY_IMAGE_BASE_URL ?? 'https://mbqb.cl'
const legacyImageAllowedHosts = new Set(
  (process.env.LEGACY_IMAGE_ALLOWED_HOSTS ?? 'mbqb.cl,cdn.shopify.com,cdn.shopifycdn.net')
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean),
)
const legacyImageFetchTimeoutMs = Number(process.env.LEGACY_IMAGE_FETCH_TIMEOUT_MS ?? 15000)
const legacyImageMaxBytes = Number(process.env.LEGACY_IMAGE_MAX_BYTES ?? 10 * 1024 * 1024)
const localeTables: Record<BodyCollection, string> = {
  canchas: 'canchas_locales',
  'la-biblia-articles': 'la_biblia_articles_locales',
  products: 'products_locales',
}

type LegacyBodyRow = {
  body: unknown
  body_html: string | null
  parent_id: number
}

type Counters = {
  alreadyFilled: number
  failed: number
  importedMedia: number
  missingHtml: number
  reusedMedia: number
  updated: number
}

type LegacyImage = {
  alt: string
  src: string
  title?: string
}

const initialCounters = (): Counters => ({
  alreadyFilled: 0,
  failed: 0,
  importedMedia: 0,
  missingHtml: 0,
  reusedMedia: 0,
  updated: 0,
})

function mediaAlt({ alt, src, title }: LegacyImage) {
  const filename = path.basename(normalizeImageUrl(src).pathname)
  return alt || title || filename || 'Migrated legacy image'
}

function mediaFilename(src: string, contentType: string) {
  const url = normalizeImageUrl(src)
  const basename = path.basename(url.pathname)
  const extension = path.extname(basename) || extensionFromContentType(contentType)
  const hash = createHash('sha256').update(src).digest('hex').slice(0, 16)

  return `legacy-${hash}${extension}`
}

function normalizeImageUrl(src: string) {
  return new URL(src, legacyImageBaseUrl)
}

function extensionFromContentType(contentType: string) {
  if (contentType.includes('jpeg')) return '.jpg'
  if (contentType.includes('png')) return '.png'
  if (contentType.includes('gif')) return '.gif'
  if (contentType.includes('webp')) return '.webp'
  if (contentType.includes('svg')) return '.svg'
  return ''
}

async function resolveLegacyImage(payload: Payload, image: LegacyImage, counters: Counters) {
  const imageUrl = normalizeImageUrl(image.src)

  if (!legacyImageAllowedHosts.has(imageUrl.hostname.toLowerCase())) {
    throw new Error(`Legacy image host is not allowed: ${imageUrl.hostname}`)
  }

  const response = await fetch(imageUrl, {
    signal: AbortSignal.timeout(legacyImageFetchTimeoutMs),
  })

  if (!response.ok) {
    throw new Error(`Failed to download ${imageUrl.href}: ${response.status} ${response.statusText}`)
  }

  const contentType = response.headers.get('content-type')?.split(';')[0] ?? ''

  if (!contentType.startsWith('image/')) {
    throw new Error(`Legacy image is not an image: ${imageUrl.href} (${contentType || 'unknown type'})`)
  }

  const contentLength = Number(response.headers.get('content-length') ?? 0)
  if (contentLength > legacyImageMaxBytes) {
    throw new Error(`Legacy image is too large: ${imageUrl.href} (${contentLength} bytes)`)
  }

  const filename = mediaFilename(imageUrl.href, contentType)
  const existing = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      filename: {
        equals: filename,
      },
    },
  })

  if (existing.docs[0]) {
    counters.reusedMedia += 1
    return { id: existing.docs[0].id }
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.byteLength > legacyImageMaxBytes) {
    throw new Error(`Legacy image is too large: ${imageUrl.href} (${buffer.byteLength} bytes)`)
  }

  const media = await payload.create({
    collection: 'media',
    data: {
      alt: mediaAlt(image),
    },
    file: {
      data: buffer,
      mimetype: contentType,
      name: filename,
      size: buffer.byteLength,
    },
    overrideAccess: true,
  })

  counters.importedMedia += 1
  return { id: media.id }
}

async function backfillCollection(payload: Payload, collection: BodyCollection) {
  let page = 1
  const counters = initialCounters()
  const table = localeTables[collection]

  while (true) {
    const offset = (page - 1) * 100
    const result = (await payload.db.drizzle.execute(sql.raw(`
      select _parent_id as parent_id, body_html, body
      from ${table}
      where _locale = '${locale}'
      order by _parent_id asc
      limit 100
      offset ${offset}
    `))) as unknown as { rows: LegacyBodyRow[] }
    const rows = result.rows

    for (const row of rows) {
      if (row.body && !force) {
        counters.alreadyFilled += 1
        continue
      }

      const bodyHtml = row.body_html ?? ''
      if (!bodyHtml) {
        counters.missingHtml += 1
        continue
      }

      try {
        if (!canConvertHTMLToLexicalBody(bodyHtml)) {
          throw new Error('Legacy HTML contains unsafe image URLs')
        }

        const body = await convertHTMLToLexicalBody(bodyHtml, {
          resolveImage: (image) => resolveLegacyImage(payload, image, counters),
        })

        await payload.db.drizzle.execute(sql`
          update ${sql.raw(table)}
          set body = ${JSON.stringify(body)}::jsonb
          where _parent_id = ${row.parent_id}
            and _locale = ${locale}
        `)
        counters.updated += 1
      } catch (error) {
        counters.failed += 1
        console.warn(`${collection}:${row.parent_id} failed`, formatMigrationError(error))
      }
    }

    if (rows.length < 100) break
    page += 1
  }

  return counters
}

async function main() {
  loadEnvForScript()
  await import('../src/env.js')

  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })
  let failed = 0

  for (const collection of collections) {
    const counters = await backfillCollection(payload, collection)
    failed += counters.failed
    console.log(`${collection}: ${JSON.stringify(counters)}`)
  }

  process.exit(failed > 0 ? 1 : 0)
}

function formatMigrationError(error: unknown) {
  if (!(error instanceof Error)) {
    return inspect(error, { depth: null })
  }

  return inspect({
    cause: 'cause' in error ? error.cause : undefined,
    data: 'data' in error ? error.data : undefined,
    message: error.message,
    name: error.name,
    stack: error.stack,
  }, { depth: null })
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
