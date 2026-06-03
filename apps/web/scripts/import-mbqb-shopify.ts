import { getPayload, type CollectionSlug, type Payload } from 'payload'

import type { Cancha } from '@/payload-types'

import { loadScriptEnv } from './loadScriptEnv.js'

loadScriptEnv()

type ShopifyPage = {
  body_html: string
  handle: string
  published_at: string | null
  title: string
  updated_at: string
}

type ShopifyProduct = {
  body_html: string
  handle: string
  images: {
    src: string
  }[]
  published_at: string | null
  title: string
  updated_at: string
  variants: {
    available: boolean
    price: string
  }[]
}

type SitemapPage = {
  lastmod?: string
  loc: string
}

const siteUrl = 'https://mbqb.cl'

const canchaHandles = new Set([
  'club-de-golf-aconcagua',
  'club-de-golf-las-palmas-del-oliveto',
  'santa-augusta-de-quintay',
  'club-de-golf-las-araucarias-de-buin',
  'club-de-golf-mapocho',
  'club-de-golf-valle-escondido',
  'club-de-golf-hacienda-santa-martina',
  'club-de-golf-angostura',
  'club-de-campo-coya',
  'club-de-golf-el-principal-de-pirque',
  'club-de-golf-el-paico-alto',
  'club-de-golf-las-brisas-de-chicureo',
  'club-de-golf-papudo',
  'club-de-golf-huinganal-limache',
  'club-de-golf-costa-cachagua',
  'club-de-golf-rio-blanco',
])

const privateCanchaHandles = new Set([
  'club-de-golf-angostura',
  'club-de-golf-costa-cachagua',
  'club-de-golf-hacienda-santa-martina',
  'club-de-golf-las-brisas-de-chicureo',
  'club-de-golf-papudo',
  'club-de-golf-valle-escondido',
])

const defaultArticleHandles = new Set(['que-pelotas-necesito-segun-mi-nivel-y-presupuesto'])

const siteSettingsDefaults = {
  brandName: 'Mas Bogeys Que Birdies',
  instagramUrl: 'https://www.instagram.com/masbogeysquebirdies/',
  whatsappUrl: 'https://wa.me/56941175839',
}

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }

  return response.json() as Promise<T>
}

const fetchText = async (url: string) => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }

  return response.text()
}

const extractSitemapUrls = async () => {
  const xml = await fetchText(
    `${siteUrl}/sitemap_pages_1.xml?from=115625590846&to=116804812862`,
  )
  const matches = [...xml.matchAll(/<url>\s*<loc>(.*?)<\/loc>(?:\s*<lastmod>(.*?)<\/lastmod>)?/g)]

  return matches.map<SitemapPage>((match) => ({
    lastmod: match[2],
    loc: match[1],
  }))
}

const extractArticleHandlesFromHub = (bodyHtml: string) => {
  const handles = new Set<string>()
  const pattern = new RegExp(`${siteUrl.replace(/\./g, '\\.')}/pages/([a-z0-9-]+)`, 'gi')

  for (const match of bodyHtml.matchAll(pattern)) {
    const handle = match[1]
    if (handle && handle !== 'la-biblia') {
      handles.add(handle)
    }
  }

  return handles
}

const discoverArticleHandles = async () => {
  const handles = new Set(defaultArticleHandles)

  try {
    const { page } = await fetchJson<{ page: ShopifyPage }>(`${siteUrl}/pages/la-biblia.json`)
    for (const handle of extractArticleHandlesFromHub(page.body_html)) {
      handles.add(handle)
    }
  } catch (error) {
    console.warn(
      'Could not fetch la-biblia hub for article discovery:',
      error instanceof Error ? error.message : error,
    )
  }

  return handles
}

const buildHandleTargets = (
  articleHandles: Set<string>,
  sitemapByHandle?: Map<string, { lastmod?: string; loc: string }>,
) => {
  const targets = new Map<string, { handle: string; lastmod?: string; loc: string }>()

  const addTarget = (handle: string) => {
    const fromSitemap = sitemapByHandle?.get(handle)
    targets.set(handle, {
      handle,
      lastmod: fromSitemap?.lastmod,
      loc: fromSitemap?.loc ?? `${siteUrl}/pages/${handle}`,
    })
  }

  for (const handle of canchaHandles) addTarget(handle)
  for (const handle of articleHandles) addTarget(handle)

  return [...targets.values()]
}

const resolvePageTargets = async () => {
  const articleHandles = await discoverArticleHandles()

  try {
    const sitemapPages = await extractSitemapUrls()
    const sitemapByHandle = new Map<string, { lastmod?: string; loc: string }>()

    for (const sitemapPage of sitemapPages) {
      const handle = sitemapPage.loc.split('/').pop()
      if (!handle) continue
      sitemapByHandle.set(handle, { lastmod: sitemapPage.lastmod, loc: sitemapPage.loc })
    }

    return {
      articleHandles,
      source: 'sitemap' as const,
      targets: buildHandleTargets(articleHandles, sitemapByHandle),
    }
  } catch (error) {
    console.warn(
      'Sitemap unavailable, using direct handle list:',
      error instanceof Error ? error.message : error,
    )
  }

  return {
    articleHandles,
    source: 'handles' as const,
    targets: buildHandleTargets(articleHandles),
  }
}

const stripTags = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const firstSentence = (html: string) => stripTags(html).split(/(?<=[.!?])\s+/)[0] ?? ''

const inferCity = (html: string) => {
  const text = stripTags(html).toLowerCase()
  const cities = [
    'Buin',
    'Cachagua',
    'Chicureo',
    'Limache',
    'Paine',
    'Papudo',
    'Pirque',
    'Quilicura',
    'Quintay',
    'Rancagua',
  ]

  return cities.find((city) => text.includes(city.toLowerCase()))
}

const inferRegion = (city?: string) => {
  if (!city) return undefined
  if (['Cachagua', 'Limache', 'Papudo', 'Quintay'].includes(city)) return 'Valparaiso'
  if (city === 'Rancagua') return "O'Higgins"
  return 'Metropolitana'
}

const toDate = (value?: null | string) => (value ? new Date(value).toISOString() : undefined)

const upsert = async (
  payload: Payload,
  collection: CollectionSlug,
  slug: string,
  data: Record<string, unknown>,
) => {
  const existing = await payload.find({
    collection,
    limit: 1,
    locale: 'es',
    overrideAccess: true,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  if (existing.docs[0]) {
    await payload.update({
      id: existing.docs[0].id,
      collection,
      data,
      locale: 'es',
      overrideAccess: true,
    })
    return 'updated'
  }

  await payload.create({
    collection,
    data,
    locale: 'es',
    overrideAccess: true,
  })
  return 'created'
}

const importProducts = async (payload: Payload) => {
  const { products } = await fetchJson<{ products: ShopifyProduct[] }>(`${siteUrl}/products.json`)
  let count = 0

  for (const product of products) {
    await upsert(payload, 'products', product.handle, {
      bodyHtml: product.body_html,
      imageUrl: product.images[0]?.src,
      priceCLP: Number(product.variants[0]?.price ?? 0),
      slug: product.handle,
      sourceUpdatedAt: toDate(product.updated_at),
      sourceUrl: `${siteUrl}/products/${product.handle}`,
      stockStatus: product.variants.some((variant) => variant.available) ? 'available' : 'unavailable',
      title: product.title,
    })
    count += 1
  }

  return count
}

const canchaManualFields = ['location', 'holes', 'publicBookingUrl'] as const

type CanchaManualFields = Pick<Cancha, (typeof canchaManualFields)[number]>

const preserveCanchaManualFields = (
  data: Record<string, unknown>,
  existing?: CanchaManualFields | null,
) => {
  if (!existing) return data

  for (const field of canchaManualFields) {
    const value = existing[field]
    if (value != null && value !== '') {
      data[field] = value
    }
  }

  return data
}

const importCancha = async (
  payload: Payload,
  handle: string,
  page: ShopifyPage,
  sourceUrl: string,
  lastmod?: string,
) => {
  const city = inferCity(page.body_html)
  const existing = await payload.find({
    collection: 'canchas',
    limit: 1,
    locale: 'es',
    overrideAccess: true,
    pagination: false,
    where: {
      slug: {
        equals: handle,
      },
    },
  })

  await upsert(
    payload,
    'canchas',
    handle,
    preserveCanchaManualFields(
      {
        accessType: privateCanchaHandles.has(handle) ? 'private' : 'pay-and-play',
        bodyHtml: page.body_html,
        city,
        region: inferRegion(city),
        slug: handle,
        sourceUpdatedAt: toDate(page.updated_at || lastmod),
        sourceUrl,
        summary: firstSentence(page.body_html),
        title: page.title,
      },
      existing.docs[0],
    ),
  )
}

const importArticle = async (
  payload: Payload,
  handle: string,
  page: ShopifyPage,
  sourceUrl: string,
  lastmod?: string,
) => {
  await upsert(payload, 'la-biblia-articles', handle, {
    bodyHtml: page.body_html,
    category: 'equipo',
    difficulty: 'principiante',
    reviewedAt: toDate(page.updated_at || lastmod),
    slug: handle,
    sourceUpdatedAt: toDate(page.updated_at || lastmod),
    sourceUrl,
    title: page.title,
  })
}

const importPages = async (payload: Payload) => {
  const { articleHandles, source, targets } = await resolvePageTargets()
  const counters = {
    articles: 0,
    canchas: 0,
    errors: [] as string[],
    pageSource: source,
  }

  for (const target of targets) {
    const { handle, lastmod, loc } = target
    const isCancha = canchaHandles.has(handle)
    const isArticle = articleHandles.has(handle)

    if (!isCancha && !isArticle) continue

    try {
      const { page } = await fetchJson<{ page: ShopifyPage }>(`${siteUrl}/pages/${handle}.json`)

      if (isCancha) {
        await importCancha(payload, handle, page, loc, lastmod)
        counters.canchas += 1
      }

      if (isArticle) {
        await importArticle(payload, handle, page, loc, lastmod)
        counters.articles += 1
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      counters.errors.push(`${handle}: ${message}`)
      console.warn(`Skipped page ${handle}: ${message}`)
    }
  }

  return counters
}

const importSiteSettings = async (payload: Payload) => {
  const existing = await payload.findGlobal({
    slug: 'site-settings',
    overrideAccess: true,
  })

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      brandName: existing.brandName?.trim() || siteSettingsDefaults.brandName,
      instagramUrl: existing.instagramUrl?.trim() || siteSettingsDefaults.instagramUrl,
      whatsappUrl: existing.whatsappUrl?.trim() || siteSettingsDefaults.whatsappUrl,
    },
    overrideAccess: true,
  })

  return existing.brandName?.trim() ? 'preserved' : 'seeded'
}

const main = async () => {
  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })

  const [productCount, pageCounts, siteSettings] = await Promise.all([
    importProducts(payload),
    importPages(payload),
    importSiteSettings(payload),
  ])

  console.log(
    JSON.stringify(
      {
        imported: {
          products: productCount,
          canchas: pageCounts.canchas,
          articles: pageCounts.articles,
          siteSettings,
          pageSource: pageCounts.pageSource,
        },
        errors: pageCounts.errors.length > 0 ? pageCounts.errors : undefined,
      },
      null,
      2,
    ),
  )

  if (pageCounts.errors.length > 0) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
