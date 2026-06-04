import {
  getPublicContentDetailPath,
  getPublicContentListingPath,
  type PublicContentCollection,
} from '@/lib/publicContentPublishing'

export const publicContentRevalidateSeconds = 15 * 60

type RevalidatePath = (path: string) => void

type MaybeSlugDoc = {
  slug?: unknown
}

const globalPublicPaths = [
  '/',
  '/canchas',
  '/la-biblia',
  '/productos',
  '/el-canal',
  '/convenios',
  '/sobre-nosotros',
]

export function getPublicCollectionRevalidationPaths({
  collection,
  doc,
  previousDoc,
}: {
  collection: PublicContentCollection
  doc?: MaybeSlugDoc | null
  previousDoc?: MaybeSlugDoc | null
}) {
  const paths = new Set<string>([getPublicContentListingPath(collection)])

  for (const slug of [getSlug(doc), getSlug(previousDoc)]) {
    if (slug) {
      paths.add(getPublicContentDetailPath(collection, slug))
    }
  }

  return Array.from(paths)
}

export async function revalidatePublicCollectionDoc(args: {
  collection: PublicContentCollection
  doc?: MaybeSlugDoc | null
  previousDoc?: MaybeSlugDoc | null
  revalidate?: RevalidatePath
}) {
  await revalidatePublicPaths(getPublicCollectionRevalidationPaths(args), args.revalidate)
}

export async function revalidateGlobalPublicContent(revalidate?: RevalidatePath) {
  await revalidatePublicPaths(globalPublicPaths, revalidate)
}

async function revalidatePublicPaths(paths: string[], revalidate?: RevalidatePath) {
  const revalidatePath = revalidate ?? (await import('next/cache')).revalidatePath

  for (const path of paths) {
    try {
      revalidatePath(path)
    } catch (error) {
      console.error(`Failed to revalidate public path "${path}"`, error)
    }
  }
}

function getSlug(doc?: MaybeSlugDoc | null) {
  return typeof doc?.slug === 'string' && doc.slug.length > 0 ? doc.slug : undefined
}
