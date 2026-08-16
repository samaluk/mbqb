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
  const payload = await getPayload({ config })
  const cmsQuery = await getCmsQueryOptions()
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
