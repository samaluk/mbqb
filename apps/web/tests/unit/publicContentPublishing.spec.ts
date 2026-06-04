import { describe, expect, it } from 'vitest'

import { getPublicContentPublishing } from '@/lib/publicContentPublishing'
import { getPublicCollectionRevalidationPaths } from '@/lib/revalidatePublicContent'

describe('Public Content Publishing', () => {
  it('builds collection preview URLs from the shared route facts', () => {
    const canchasPublishing = getPublicContentPublishing('canchas')
    const laBibliaPublishing = getPublicContentPublishing('la-biblia-articles')
    const productsPublishing = getPublicContentPublishing('products')
    const canchasPreview = parsePreviewUrl(
      canchasPublishing.admin.preview?.({ slug: 'club-test' }, { locale: 'es' } as never),
    )
    const laBibliaPreview = parsePreviewUrl(
      laBibliaPublishing.admin.preview?.(
        { slug: 'reglas-basicas' },
        { locale: 'en' } as never,
      ),
    )
    const productPreview = parsePreviewUrl(
      productsPublishing.admin.livePreview?.url({
        data: { slug: 'polera' },
      } as never),
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
      path: '/productos/polera',
      slug: 'polera',
    })
    expect(canchasPreview.previewSecret).toBeTruthy()
  })

  it('does not build preview URLs for content without a slug', () => {
    const publishing = getPublicContentPublishing('products')

    expect(publishing.admin.preview?.({}, { locale: 'es' } as never)).toBeNull()
    expect(publishing.admin.livePreview?.url({ data: {} } as never)).toBeNull()
  })

  it('builds listing and detail revalidation paths from the same route facts', () => {
    expect(
      getPublicCollectionRevalidationPaths({
        collection: 'la-biblia-articles',
        doc: { slug: 'nuevo-slug' },
        previousDoc: { slug: 'slug-viejo' },
      }),
    ).toEqual(['/la-biblia', '/la-biblia/nuevo-slug', '/la-biblia/slug-viejo'])

    expect(
      getPublicCollectionRevalidationPaths({
        collection: 'products',
        doc: { slug: 'gorra' },
      }),
    ).toEqual(['/productos', '/productos/gorra'])
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
