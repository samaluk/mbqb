import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
} from 'payload'

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

type MaybePublicDoc = SlugData & {
  _status?: unknown
}

type RevalidatePath = (path: string) => void

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

export const publicContentRevalidateSeconds = 15 * 60

const globalPublicPaths = [
  '/',
  '/canchas',
  '/la-biblia',
  '/productos',
  '/el-canal',
  '/convenios',
  '/sobre-nosotros',
]

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
    hooks: {
      afterChange: [revalidatePublicContentChange(collection)],
      afterDelete: [revalidatePublicContentDelete(collection)],
    },
    versions: draftVersions,
  } satisfies Pick<CollectionConfig, 'access' | 'admin' | 'hooks' | 'versions'>
}

export function getPublicContentListingPath(collection: PublicContentCollection) {
  return publicContentTargets[collection].listingPath
}

export function getPublicContentDetailPath(collection: PublicContentCollection, slug: string) {
  return `${publicContentTargets[collection].detailPrefix}/${slug}`
}

export function getPublicContentRevalidationPaths({
  collection,
  doc,
  previousDoc,
}: {
  collection: PublicContentCollection
  doc?: MaybePublicDoc | null
  previousDoc?: MaybePublicDoc | null
}) {
  const paths = new Set<string>([getPublicContentListingPath(collection)])

  for (const slug of [getSlug(doc), getSlug(previousDoc)]) {
    if (slug) {
      paths.add(getPublicContentDetailPath(collection, slug))
    }
  }

  return Array.from(paths)
}

export async function revalidateGlobalPublicContent(revalidate?: RevalidatePath) {
  await revalidatePublicPaths(globalPublicPaths, revalidate)
}

export async function revalidatePublicContentDoc(args: {
  collection: PublicContentCollection
  doc?: MaybePublicDoc | null
  previousDoc?: MaybePublicDoc | null
  revalidate?: RevalidatePath
}) {
  if (!shouldRevalidatePublicContent(args.doc, args.previousDoc)) return

  await revalidatePublicPaths(getPublicContentRevalidationPaths(args), args.revalidate)
}

export async function revalidateDeletedPublicContentDoc(args: {
  collection: PublicContentCollection
  doc?: MaybePublicDoc | null
  revalidate?: RevalidatePath
}) {
  if (!isPublished(args.doc)) return

  await revalidatePublicPaths(getPublicContentRevalidationPaths(args), args.revalidate)
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

function revalidatePublicContentChange(
  collection: PublicContentCollection,
): CollectionAfterChangeHook {
  return async ({ doc, previousDoc }) =>
    revalidatePublicContentDoc({
      collection,
      doc,
      previousDoc,
    })
}

function revalidatePublicContentDelete(
  collection: PublicContentCollection,
): CollectionAfterDeleteHook {
  return async ({ doc }) =>
    revalidateDeletedPublicContentDoc({
      collection,
      doc,
    })
}

function shouldRevalidatePublicContent(
  doc?: MaybePublicDoc | null,
  previousDoc?: MaybePublicDoc | null,
) {
  return isPublished(doc) || isPublished(previousDoc)
}

async function revalidatePublicPaths(paths: string[], revalidate?: RevalidatePath) {
  const revalidatePath =
    revalidate ??
    (await import('next/cache')
      .then(({ revalidatePath: nextRevalidatePath }) => nextRevalidatePath)
      .catch((error) => {
        // `next/cache` resolves only inside Next's runtime. Standalone
        // Payload scripts (for example, the Playwright fixture seed) run
        // outside it; revalidation is best-effort there. Inside Next, a
        // resolution failure must stay visible instead of silently disabling
        // public-path revalidation, so rethrow.
        if (process.env.NEXT_RUNTIME) throw error
        console.error(`Failed to load next/cache outside Next runtime`, error)
        return null
      }))

  if (!revalidatePath) return

  for (const path of paths) {
    try {
      revalidatePath(path)
    } catch (error) {
      console.error(`Failed to revalidate public path "${path}"`, error)
    }
  }
}

function getSlug(doc?: MaybePublicDoc | null) {
  return typeof doc?.slug === 'string' && doc.slug.length > 0 ? doc.slug : undefined
}

function isPublished(doc?: MaybePublicDoc | null) {
  return doc?._status === 'published'
}
