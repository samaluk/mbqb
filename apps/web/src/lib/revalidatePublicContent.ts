export const publicContentRevalidateSeconds = 15 * 60

type PublicCollection = 'canchas' | 'la-biblia-articles' | 'products'

type RevalidatePath = (path: string) => void

type MaybeSlugDoc = {
  slug?: unknown
}

const collectionListings: Record<PublicCollection, string> = {
  canchas: '/canchas',
  'la-biblia-articles': '/la-biblia',
  products: '/productos',
}

const collectionDetailPrefixes: Record<PublicCollection, string> = {
  canchas: '/canchas',
  'la-biblia-articles': '/la-biblia',
  products: '/productos',
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
  collection: PublicCollection
  doc?: MaybeSlugDoc | null
  previousDoc?: MaybeSlugDoc | null
}) {
  const paths = new Set<string>([collectionListings[collection]])
  const prefix = collectionDetailPrefixes[collection]

  for (const slug of [getSlug(doc), getSlug(previousDoc)]) {
    if (slug) {
      paths.add(`${prefix}/${slug}`)
    }
  }

  return Array.from(paths)
}

export async function revalidatePublicCollectionDoc(args: {
  collection: PublicCollection
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
