/**
 * Seeds the fixture content the instant-navigation e2e suite runs against:
 * published canchas, La Biblia articles, and products with fixed slugs.
 *
 * Idempotent: upserts by slug. Runs against POSTGRES_URL (the same database
 * the served build reads). Invoked from the Playwright globalSetup and can
 * also be run standalone: `pnpm exec tsx scripts/seed-e2e-fixtures.ts`.
 */
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'

import { loadTestEnv } from './loadScriptEnv.js'

loadTestEnv()
await import('../src/env.js')

const richTextBody = {
  root: {
    type: 'root',
    format: 'richText',
    version: 2,
    direction: 'ltr',
    children: [
      {
        type: 'paragraph',
        version: 1,
        children: [
          {
            text: 'Contenido de fixture para el test de navegacion instantanea.',
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
      },
    ],
  },
}

const fixtures = {
  canchas: [
    {
      accessType: 'pay-and-play',
      body: richTextBody,
      slug: 'cancha-fixture-1',
      sourceUrl: 'https://mbqb.cl/fixture/cancha-1',
      summary: 'Cancha de fixture con greens rapidos.',
      title: 'Cancha Fixture Uno',
    },
    {
      accessType: 'private',
      body: richTextBody,
      slug: 'cancha-fixture-2',
      sourceUrl: 'https://mbqb.cl/fixture/cancha-2',
      summary: 'Cancha de fixture privada.',
      title: 'Cancha Fixture Dos',
    },
  ],
  'la-biblia-articles': [
    {
      body: richTextBody,
      category: 'primeros-pasos',
      difficulty: 'principiante',
      slug: 'articulo-fixture-1',
      sourceUrl: 'https://mbqb.cl/fixture/articulo-1',
      title: 'Articulo Fixture Uno',
    },
    {
      body: richTextBody,
      category: 'reglas-y-etiqueta',
      difficulty: 'intermedio',
      slug: 'articulo-fixture-2',
      sourceUrl: 'https://mbqb.cl/fixture/articulo-2',
      title: 'Articulo Fixture Dos',
    },
  ],
  products: [
    {
      body: richTextBody,
      priceCLP: 15_000,
      slug: 'producto-fixture-1',
      sourceUrl: 'https://mbqb.cl/fixture/producto-1',
      stockStatus: 'available',
      title: 'Producto Fixture Uno',
    },
    {
      body: richTextBody,
      priceCLP: 25_000,
      slug: 'producto-fixture-2',
      sourceUrl: 'https://mbqb.cl/fixture/producto-2',
      stockStatus: 'unavailable',
      title: 'Producto Fixture Dos',
    },
  ],
} as const

const fixtureCollections = ['canchas', 'la-biblia-articles', 'products'] as const

type FixtureCollection = (typeof fixtureCollections)[number]

async function upsertFixtures() {
  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })

  for (const collection of fixtureCollections) {
    const docs = fixtures[collection] as readonly Record<string, unknown>[]

    for (const data of docs) {
      const slug = String(data.slug)
      const existing = await payload.find({
        collection,
        depth: 0,
        draft: true,
        limit: 1,
        locale: 'es',
        overrideAccess: true,
        where: {
          slug: { equals: slug },
        },
      })

      if (existing.docs[0]?.id) {
        await payload.update({
          id: existing.docs[0].id,
          collection,
          data: {
            ...data,
            _status: 'published',
          } as RequiredDataFromCollectionSlug<FixtureCollection>,
          draft: false,
          locale: 'es',
          overrideAccess: true,
        })
        console.log(`[seed] updated ${collection}/${slug}`)
      } else {
        await payload.create({
          collection,
          data: {
            ...data,
            _status: 'published',
          } as RequiredDataFromCollectionSlug<FixtureCollection>,
          draft: false,
          locale: 'es',
          overrideAccess: true,
        })
        console.log(`[seed] created ${collection}/${slug}`)
      }
    }
  }
}

export async function seedE2eFixtures() {
  await upsertFixtures()
  console.log('[seed] fixture content ready')
}

if (process.argv[1]?.endsWith('seed-e2e-fixtures.ts')) {
  await seedE2eFixtures()
}
