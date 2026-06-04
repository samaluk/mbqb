import config from '@payload-config'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { MetaPills, PageDetail, PageKicker, PageTitle, RichContent } from '@/components/page'
import { getCmsQueryOptions } from '@/lib/cmsQuery'

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

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params
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
  const product = products.docs[0]

  if (!product) notFound()

  return (
    <PageDetail>
      <Link className="w-fit text-[15px] font-extrabold text-green no-underline" href="/productos">
        Volver a productos
      </Link>
      <PageKicker>Producto</PageKicker>
      <PageTitle>{product.title}</PageTitle>
      <MetaPills
        items={[
          formatPrice(product.priceCLP),
          product.stockStatus === 'available' ? 'Disponible' : 'Agotado',
        ]}
      />
      {product.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className="aspect-[5/3] h-auto w-[min(100%,640px)] rounded-lg object-cover max-[760px]:aspect-[16/9]"
          src={product.imageUrl}
        />
      ) : null}
      <RichContent body={product.body} />
    </PageDetail>
  )
}
