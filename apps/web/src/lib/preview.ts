type PreviewTarget = {
  collection: string
  path: string
  slug: string
  locale?: unknown
}

function normalizeLocale(locale: unknown) {
  return typeof locale === 'string' ? locale : null
}

export function buildPreviewPath(path: string, locale?: unknown) {
  const normalizedLocale = normalizeLocale(locale)
  if (!normalizedLocale || normalizedLocale === 'es') {
    return path
  }

  const url = new URL(path, 'http://localhost')
  url.searchParams.set('locale', normalizedLocale)
  return `${url.pathname}${url.search}`
}

export function buildPreviewUrl({ collection, path, slug, locale }: PreviewTarget) {
  const params = new URLSearchParams({
    collection,
    path: buildPreviewPath(path, normalizeLocale(locale)),
    previewSecret: process.env.PREVIEW_SECRET || '',
    slug,
  })

  return `/preview?${params.toString()}`
}

export const draftVersions = {
  drafts: {
    autosave: {
      interval: 375,
    },
  },
} as const
