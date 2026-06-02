import config from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
    <section className="page-shell">
      <div className="page-kicker">Productos</div>
      <h1 className="page-title">Merch MBQB.</h1>
      <p className="page-lede">
        Catalogo simple de productos MBQB con detalles y contacto directo por WhatsApp para
        consultas.
      </p>
      <div className="compact-grid">
        {products.docs.map((product) => (
          <Card className="compact-card min-w-0" key={product.id}>
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt=""
                className="aspect-[5/3] w-full object-cover max-[760px]:aspect-[16/9]"
                src={product.imageUrl}
              />
            ) : null}
            <CardHeader>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{formatPrice(product.priceCLP)}</Badge>
                <Badge variant={product.stockStatus === 'available' ? 'secondary' : 'destructive'}>
                  {product.stockStatus === 'available' ? 'Disponible' : 'Agotado'}
                </Badge>
              </div>
              <CardTitle className="compact-card-title">{product.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div
                className="rich-snippet max-w-none text-base text-muted max-[760px]:text-sm max-[760px]:leading-[1.4]"
                dangerouslySetInnerHTML={{ __html: product.bodyHtml }}
              />
              <Button asChild className="w-fit font-extrabold" variant="link">
                <Link href={`/productos/${product.slug}`}>Ver producto</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
