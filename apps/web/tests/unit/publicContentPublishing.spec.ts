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
    const canchasPreview = parsePreviewUrl(
      getPublicContentPreviewUrl({
        collection: 'canchas',
        data: { slug: 'club-test' },
        locale: 'es',
      }),
    )
    const laBibliaPreview = parsePreviewUrl(
      getPublicContentPreviewUrl({
        collection: 'la-biblia-articles',
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

    expect(canchasPreview).toMatchObject({
      collection: 'canchas',
      path: '/canchas/club-test',
      slug: 'club-test',
    })
    expect(laBibliaPreview).toMatchObject({
      collection: 'la-biblia-articles',
      path: '/la-biblia/reglas-basicas?locale=en',
      slug: 'reglas-basicas',
    })
    expect(productPreview).toMatchObject({
      collection: 'products',
      path: '/products/polera',
      slug: 'polera',
    })
    expect(canchasPreview.previewSecret).toBeTruthy()
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
        collection: 'la-biblia-articles',
        doc: { slug: 'nuevo-slug' },
        previousDoc: { slug: 'slug-viejo' },
      }),
    ).toEqual(['/la-biblia', '/la-biblia/nuevo-slug', '/la-biblia/slug-viejo'])

    expect(
      getPublicContentRevalidationPaths({
        collection: 'products',
        doc: { slug: 'gorra' },
      }),
    ).toEqual(['/products', '/products/gorra'])
  })

  it('wires public route revalidation hooks into collection publishing', () => {
    const publishing = getPublicContentPublishing('canchas')
    const afterChange = publishing.hooks.afterChange?.[0]
    const afterDelete = publishing.hooks.afterDelete?.[0]

    expect(afterChange).toBeDefined()
    expect(afterDelete).toBeDefined()
  })

  it('revalidates public collection routes for published changes', async () => {
    const revalidatedPaths: string[] = []
    const revalidate = (path: string) => revalidatedPaths.push(path)

    await revalidatePublicContentDoc({
      collection: 'canchas',
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
      collection: 'canchas',
      doc: {
        _status: 'published',
        slug: 'nuevo-slug',
      },
      revalidate,
    })

    expect(revalidatedPaths).toEqual([
      '/canchas',
      '/canchas/nuevo-slug',
      '/canchas/slug-viejo',
      '/canchas',
      '/canchas/nuevo-slug',
    ])
  })

  it('skips public route revalidation for draft-only changes', async () => {
    const revalidatedPaths: string[] = []

    await revalidatePublicContentDoc({
      collection: 'la-biblia-articles',
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
