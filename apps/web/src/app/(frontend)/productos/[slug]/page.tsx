import Link from 'next/link'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { MetaPills, PageDetail, PageKicker, PageTitle, RichContent } from '@/components/page'
import { getDraftPayloadDocBySlug, getPublishedPayloadDocBySlug } from '@/lib/payloadBySlug'

// Module scope: constructing an Intl formatter loads locale data, so build
// the CLP currency formatter once instead of per render.
const clpFormatter = new Intl.NumberFormat('es-CL', {
  currency: 'CLP',
  maximumFractionDigits: 0,
  style: 'currency',
})

const formatPrice = (value: number) => clpFormatter.format(value)

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
  const product = draft
    ? await getDraftPayloadDocBySlug('products', slug)
    : await getPublishedPayloadDocBySlug('products', slug)

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
