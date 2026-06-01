import 'dotenv/config'

import config from '@payload-config'
import { getPayload, type CollectionSlug, type Payload } from 'payload'

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

const legacyHubHandles = new Set([
  'canchas-pay-and-play',
  'canchas-privadas',
  'el-bogeyficador',
  'el-canal',
  'la-biblia',
  'nuestos-convenios',
  'sobre-nosotros',
])

const articleHandles = new Set(['que-pelotas-necesito-segun-mi-nivel-y-presupuesto'])

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

const importPages = async (payload: Payload) => {
  const sitemapPages = await extractSitemapUrls()
  const counters = {
    articles: 0,
    canchas: 0,
    legacyPages: 0,
  }

  for (const sitemapPage of sitemapPages) {
    const handle = sitemapPage.loc.split('/').pop()

    if (!handle) continue

    const { page } = await fetchJson<{ page: ShopifyPage }>(`${siteUrl}/pages/${handle}.json`)

    if (canchaHandles.has(handle)) {
      const city = inferCity(page.body_html)

      await upsert(payload, 'canchas', handle, {
        accessType: privateCanchaHandles.has(handle) ? 'private' : 'pay-and-play',
        bodyHtml: page.body_html,
        city,
        region: inferRegion(city),
        slug: handle,
        sourceUpdatedAt: toDate(page.updated_at || sitemapPage.lastmod),
        sourceUrl: sitemapPage.loc,
        summary: firstSentence(page.body_html),
        title: page.title,
      })
      counters.canchas += 1
      continue
    }

    if (articleHandles.has(handle)) {
      await upsert(payload, 'la-biblia-articles', handle, {
        bodyHtml: page.body_html,
        category: 'equipo',
        difficulty: 'principiante',
        reviewedAt: toDate(page.updated_at || sitemapPage.lastmod),
        slug: handle,
        sourceUpdatedAt: toDate(page.updated_at || sitemapPage.lastmod),
        sourceUrl: sitemapPage.loc,
        title: page.title,
      })
      counters.articles += 1
      continue
    }

    if (legacyHubHandles.has(handle)) {
      await upsert(payload, 'legacy-pages', handle, {
        bodyHtml: page.body_html,
        legacyKind:
          handle === 'el-bogeyficador' ? 'bogeyficador' : handle === 'la-biblia' ? 'hub' : 'page',
        slug: handle,
        sourceUpdatedAt: toDate(page.updated_at || sitemapPage.lastmod),
        sourceUrl: sitemapPage.loc,
        title: page.title,
      })
      counters.legacyPages += 1
    }
  }

  return counters
}

const main = async () => {
  const payload = await getPayload({ config })

  const [productCount, pageCounts] = await Promise.all([importProducts(payload), importPages(payload)])

  console.log(
    JSON.stringify(
      {
        imported: {
          products: productCount,
          ...pageCounts,
        },
      },
      null,
      2,
    ),
  )
}

await main()
process.exit(0)
