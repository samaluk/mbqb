import { describe, expect, it } from 'vitest'

import {
  getPublicContentPreviewUrl,
  getPublicContentPublishing,
  getPublicContentRevalidationPaths,
  revalidateDeletedPublicContentDoc,
  revalidatePublicContentDoc,
} from '@/lib/publicContentPublishing'

describe('Public Content Publishing', () => {
  it('builds collection preview URLs from the shared route facts', () => {
    const placesPreview = parsePreviewUrl(
      getPublicContentPreviewUrl({
        collection: 'places',
        data: { slug: 'club-test' },
        locale: 'es',
      }),
    )
    const articlesPreview = parsePreviewUrl(
      getPublicContentPreviewUrl({
        collection: 'articles',
        data: { slug: 'reglas-basicas' },
        locale: 'en',
      }),
    )
    const productPreview = parsePreviewUrl(
      getPublicContentPreviewUrl({
        collection: 'products',
        data: { slug: 'polera' },
        locale: 'es',
      }),
    )

    expect(placesPreview).toMatchObject({
      collection: 'places',
      path: '/places/club-test',
      slug: 'club-test',
    })
    expect(articlesPreview).toMatchObject({
      collection: 'articles',
      path: '/articles/reglas-basicas?locale=en',
      slug: 'reglas-basicas',
    })
    expect(productPreview).toMatchObject({
      collection: 'products',
      path: '/products/polera',
      slug: 'polera',
    })
    expect(placesPreview.previewSecret).toBeTruthy()
  })

  it('does not build preview URLs for content without a slug', () => {
    expect(
      getPublicContentPreviewUrl({ collection: 'products', data: {}, locale: 'es' }),
    ).toBeNull()
    expect(getPublicContentPreviewUrl({ collection: 'products' })).toBeNull()
  })

  it('builds listing and detail revalidation paths from the same route facts', () => {
    expect(
      getPublicContentRevalidationPaths({
        collection: 'articles',
        doc: { slug: 'nuevo-slug' },
        previousDoc: { slug: 'slug-viejo' },
      }),
    ).toEqual(['/articles', '/articles/nuevo-slug', '/articles/slug-viejo'])

    expect(
      getPublicContentRevalidationPaths({
        collection: 'products',
        doc: { slug: 'gorra' },
      }),
    ).toEqual(['/products', '/products/gorra'])
  })

  it('wires public route revalidation hooks into collection publishing', () => {
    const publishing = getPublicContentPublishing('places')
    const afterChange = publishing.hooks.afterChange?.[0]
    const afterDelete = publishing.hooks.afterDelete?.[0]

    expect(afterChange).toBeDefined()
    expect(afterDelete).toBeDefined()
  })

  it('revalidates public collection routes for published changes', async () => {
    const revalidatedPaths: string[] = []
    const revalidate = (path: string) => revalidatedPaths.push(path)

    await revalidatePublicContentDoc({
      collection: 'places',
      doc: {
        _status: 'published',
        slug: 'nuevo-slug',
      },
      previousDoc: {
        _status: 'published',
        slug: 'slug-viejo',
      },
      revalidate,
    })

    await revalidateDeletedPublicContentDoc({
      collection: 'places',
      doc: {
        _status: 'published',
        slug: 'nuevo-slug',
      },
      revalidate,
    })

    expect(revalidatedPaths).toEqual([
      '/places',
      '/places/nuevo-slug',
      '/places/slug-viejo',
      '/places',
      '/places/nuevo-slug',
    ])
  })

  it('skips public route revalidation for draft-only changes', async () => {
    const revalidatedPaths: string[] = []

    await revalidatePublicContentDoc({
      collection: 'articles',
      doc: {
        _status: 'draft',
        slug: 'draft-slug',
      },
      previousDoc: {
        _status: 'draft',
        slug: 'old-draft-slug',
      },
      revalidate: (path: string) => revalidatedPaths.push(path),
    })

    expect(revalidatedPaths).toEqual([])
  })
})

function parsePreviewUrl(value: string | null | undefined) {
  if (!value) throw new Error('Expected preview URL')

  const url = new URL(value, 'http://localhost')

  return {
    collection: url.searchParams.get('collection'),
    path: url.searchParams.get('path'),
    previewSecret: url.searchParams.get('previewSecret'),
    slug: url.searchParams.get('slug'),
  }
}
