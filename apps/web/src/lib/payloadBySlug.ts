import config from '@payload-config'
import { cacheLife } from 'next/cache'
import { getPayload } from 'payload'
import type { CollectionSlug, DataFromCollectionSlug } from 'payload'

import { getCmsQueryOptions, getPublishedCmsQueryOptions } from '@/lib/cmsQuery'
import { isPayloadUnavailableError } from '@/lib/payloadUnavailableError'
import type { Config } from '@/payload-types'

export async function getDraftPayloadDocBySlug<TSlug extends CollectionSlug<Config>>(
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

export async function getPublishedPayloadDocBySlug<TSlug extends CollectionSlug<Config>>(
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
export async function getPublishedPayloadDocs<TSlug extends CollectionSlug<Config>>(
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
export async function getDraftPayloadDocs<TSlug extends CollectionSlug<Config>>(
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
