import config from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('es-CL', {
    currency: 'CLP',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value)

export default async function ProductosPage() {
  const payload = await getPayload({ config })
  const products = await payload.find({
    collection: 'products',
    depth: 0,
    limit: 20,
    locale: 'es',
    sort: 'title',
  })

  return (
    <section className="page-shell simple-page">
      <div className="eyebrow">Productos</div>
      <h1>Merch MBQB.</h1>
      <p>
        Catalogo simple de productos MBQB con detalles y contacto directo por WhatsApp para
        consultas.
      </p>
      <div className="content-grid">
        {products.docs.map((product) => (
          <article className="content-card product-card" key={product.id}>
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="" src={product.imageUrl} />
            ) : null}
            <div className="card-meta">
              <span>{formatPrice(product.priceCLP)}</span>
              <span>{product.stockStatus === 'available' ? 'Disponible' : 'Agotado'}</span>
            </div>
            <h2>{product.title}</h2>
            <div
              className="rich-snippet"
              dangerouslySetInnerHTML={{ __html: product.bodyHtml }}
            />
            <Link href={`/productos/${product.slug}`}>Ver producto</Link>
          </article>
        ))}
      </div>
    </section>
  )
}
