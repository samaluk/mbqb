import config from '@payload-config'
import { cacheLife } from 'next/cache'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import type { CollectionSlug, DataFromCollectionSlug } from 'payload'
import type { Metadata } from 'next'
import { cache } from 'react'

import { getCmsQueryOptions, getPublishedCmsQueryOptions } from '@/lib/cmsQuery'
import { isPayloadUnavailableError } from '@/lib/payloadUnavailableError'
import type { Config } from '@/payload-types'

/**
 * Draft-mode dispatch shared by every public content route: previews read the
 * draft variants, everyone else reads the published, cached ones.
 *
 * React `cache()` memoizes per request, so `generateMetadata` and the page
 * body resolve a given slug once per render instead of querying Payload twice
 * (the published path is additionally absorbed by its `'use cache'` function).
 */
export const getPayloadDocBySlug = cache(async function getPayloadDocBySlug<
  TSlug extends CollectionSlug<Config>,
>(collection: TSlug, slug: string): Promise<DataFromCollectionSlug<TSlug> | null> {
  const { isEnabled: draft } = await draftMode()

  return draft
    ? await getDraftPayloadDocBySlug(collection, slug)
    : await getPublishedPayloadDocBySlug(collection, slug)
})

/** Draft-mode dispatch for listing routes (see {@link getPayloadDocBySlug}). */
export async function getPayloadDocs<TSlug extends CollectionSlug<Config>>(
  collection: TSlug,
): Promise<DataFromCollectionSlug<TSlug>[]> {
  const { isEnabled: draft } = await draftMode()

  return draft ? await getDraftPayloadDocs(collection) : await getPublishedPayloadDocs(collection)
}

/**
 * `generateMetadata` factory for detail routes: titles the page after the
 * fetched doc, falling back when the doc is missing.
 */
export function payloadDocMetadata(
  collection: CollectionSlug<Config>,
  fallbackTitle: string,
): (props: { params: Promise<{ slug: string }> }) => Promise<Metadata> {
  return async ({ params }) => {
    const { slug } = await params
    const doc = await getPayloadDocBySlug(collection, slug)

    if (!doc) return { title: fallbackTitle }

    return { title: 'title' in doc && typeof doc.title === 'string' ? doc.title : fallbackTitle }
  }
}

async function getDraftPayloadDocBySlug<TSlug extends CollectionSlug<Config>>(
  collection: TSlug,
  slug: string,
): Promise<DataFromCollectionSlug<TSlug> | null> {
  // Payload boot and CMS query options are independent, so race them.
  const [payload, cmsQuery] = await Promise.all([getPayload({ config }), getCmsQueryOptions()])
  const docs = await payload.find({
    collection,
    depth: 1,
    limit: 1,
    locale: 'es',
    ...cmsQuery,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return docs.docs[0] ?? null
}

async function getPublishedPayloadDocBySlug<TSlug extends CollectionSlug<Config>>(
  collection: TSlug,
  slug: string,
): Promise<DataFromCollectionSlug<TSlug> | null> {
  'use cache'
  cacheLife('publicContent')

  try {
    const payload = await getPayload({ config })
    const docs = await payload.find({
      collection,
      depth: 1,
      limit: 1,
      locale: 'es',
      ...getPublishedCmsQueryOptions(),
      where: {
        slug: {
          equals: slug,
        },
      },
    })

    return docs.docs[0] ?? null
  } catch (error) {
    if (!isPayloadUnavailableError(error)) {
      console.error(`Failed to load ${collection} "${slug}"`, error)
    }

    return null
  }
}

/**
 * Latest 20 published docs of a public content collection, cached. Payload
 * outages degrade to an empty list instead of failing the route.
 */
async function getPublishedPayloadDocs<TSlug extends CollectionSlug<Config>>(
  collection: TSlug,
): Promise<DataFromCollectionSlug<TSlug>[]> {
  'use cache'
  cacheLife('publicContent')

  try {
    const payload = await getPayload({ config })
    const docs = await payload.find({
      collection,
      depth: 1,
      limit: 20,
      locale: 'es',
      sort: 'title',
      ...getPublishedCmsQueryOptions(),
    })

    return docs.docs
  } catch (error) {
    if (!isPayloadUnavailableError(error)) {
      console.error(`Failed to load ${collection}`, error)
    }

    return []
  }
}

/** Latest 20 docs of a collection including drafts, for draft-mode previews. */
async function getDraftPayloadDocs<TSlug extends CollectionSlug<Config>>(
  collection: TSlug,
): Promise<DataFromCollectionSlug<TSlug>[]> {
  // Payload boot and CMS query options are independent, so race them.
  const [payload, cmsQuery] = await Promise.all([getPayload({ config }), getCmsQueryOptions()])
  const docs = await payload.find({
    collection,
    depth: 1,
    limit: 20,
    locale: 'es',
    sort: 'title',
    ...cmsQuery,
  })

  return docs.docs
}
