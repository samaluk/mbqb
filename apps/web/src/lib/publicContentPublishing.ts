import type { CollectionConfig } from 'payload'

import { publishedOrStaff } from '@/access/publishedOrStaff'
import { isEditorOrAdmin } from '@/access/roles'
import { buildPreviewUrl, draftVersions } from '@/lib/preview'

export type PublicContentCollection = 'canchas' | 'la-biblia-articles' | 'products'

type PublicContentPublishingTarget = {
  collection: PublicContentCollection
  detailPrefix: string
  listingPath: string
}

type SlugData = {
  slug?: unknown
}

const publicContentTargets = {
  canchas: {
    collection: 'canchas',
    detailPrefix: '/canchas',
    listingPath: '/canchas',
  },
  'la-biblia-articles': {
    collection: 'la-biblia-articles',
    detailPrefix: '/la-biblia',
    listingPath: '/la-biblia',
  },
  products: {
    collection: 'products',
    detailPrefix: '/productos',
    listingPath: '/productos',
  },
} satisfies Record<PublicContentCollection, PublicContentPublishingTarget>

export function getPublicContentPublishing(collection: PublicContentCollection) {
  const target = publicContentTargets[collection]

  return {
    access: {
      create: isEditorOrAdmin,
      delete: isEditorOrAdmin,
      read: publishedOrStaff,
      update: isEditorOrAdmin,
    },
    admin: {
      livePreview: {
        url: ({ data, locale }) => buildPublicContentPreviewUrl(target, data, locale),
      },
      preview: (data, { locale }) => buildPublicContentPreviewUrl(target, data, locale),
    },
    versions: draftVersions,
  } satisfies Pick<CollectionConfig, 'access' | 'admin' | 'versions'>
}

export function getPublicContentListingPath(collection: PublicContentCollection) {
  return publicContentTargets[collection].listingPath
}

export function getPublicContentDetailPath(collection: PublicContentCollection, slug: string) {
  return `${publicContentTargets[collection].detailPrefix}/${slug}`
}

function buildPublicContentPreviewUrl(
  target: PublicContentPublishingTarget,
  data: SlugData | undefined,
  locale: unknown,
) {
  const slug = typeof data?.slug === 'string' ? data.slug : ''

  if (!slug) return null

  return buildPreviewUrl({
    collection: target.collection,
    locale,
    path: getPublicContentDetailPath(target.collection, slug),
    slug,
  })
}
