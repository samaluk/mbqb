import config from '@payload-config'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

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
  const products = await payload.find({
    collection: 'products',
    depth: 0,
    limit: 1,
    locale: 'es',
    where: {
      slug: {
        equals: slug,
      },
    },
  })
  const product = products.docs[0]

  if (!product) notFound()

  return (
    <article className="page-shell detail-page product-detail">
      <Link className="back-link" href="/productos">
        Volver a productos
      </Link>
      <div className="eyebrow">Producto</div>
      <h1>{product.title}</h1>
      <div className="card-meta">
        <span>{formatPrice(product.priceCLP)}</span>
        <span>{product.stockStatus === 'available' ? 'Disponible' : 'Agotado'}</span>
      </div>
      {product.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" className="detail-image" src={product.imageUrl} />
      ) : null}
      <div className="rich-content" dangerouslySetInnerHTML={{ __html: product.bodyHtml }} />
    </article>
  )
}
