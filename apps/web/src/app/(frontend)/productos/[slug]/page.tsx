import config from '@payload-config'
import Link from 'next/link'
import { cacheLife } from 'next/cache'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import { Suspense } from 'react'
import { getPayload } from 'payload'

import { MetaPills, PageDetail, PageKicker, PageTitle, RichContent } from '@/components/page'
import { getCmsQueryOptions, getPublishedCmsQueryOptions } from '@/lib/cmsQuery'
import { isPayloadUnavailableError } from '@/lib/payloadUnavailableError'
import type { Product } from '@/payload-types'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('es-CL', {
    currency: 'CLP',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value)

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export default function ProductDetailPage({ params }: PageProps) {
  return (
    <PageDetail>
      <Link className="back-link" data-testid="product-detail-back-link" href="/productos">
        Volver a productos
      </Link>
      <PageKicker>Producto</PageKicker>
      <Suspense fallback={null}>
        <ProductDetailContent params={params} />
      </Suspense>
    </PageDetail>
  )
}

async function ProductDetailContent({ params }: PageProps) {
  const { slug } = await params
  const { isEnabled: draft } = await draftMode()
  const product = draft ? await getDraftProduct(slug) : await getPublishedProduct(slug)

  if (!product) notFound()

  return (
    <>
      <PageTitle data-testid="product-detail-title">{product.title}</PageTitle>
      <MetaPills
        items={[
          formatPrice(product.priceCLP),
          product.stockStatus === 'available' ? 'Disponible' : 'Agotado',
        ]}
      />
      {product.imageUrl ? (
        <img
          alt=""
          className="aspect-5/3 h-auto w-product-image rounded-lg object-cover max-[760px]:aspect-video"
          src={product.imageUrl}
        />
      ) : null}
      <RichContent body={product.body} />
    </>
  )
}

async function getPublishedProduct(slug: string): Promise<Product | null> {
  'use cache'
  cacheLife('publicContent')

  try {
    const payload = await getPayload({ config })
    const products = await payload.find({
      collection: 'products',
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

    return products.docs[0] ?? null
  } catch (error) {
    if (!isPayloadUnavailableError(error)) {
      console.error(`Failed to load product "${slug}"`, error)
    }

    return null
  }
}

async function getDraftProduct(slug: string): Promise<Product | null> {
  const payload = await getPayload({ config })
  const cmsQuery = await getCmsQueryOptions()
  const products = await payload.find({
    collection: 'products',
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

  return products.docs[0] ?? null
}
