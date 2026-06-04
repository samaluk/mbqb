import config from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'

import {
  PageGrid,
  PageKicker,
  PageLede,
  PageShell,
  PageTitle,
  RichSnippet,
} from '@/components/page'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCmsQueryOptions } from '@/lib/cmsQuery'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('es-CL', {
    currency: 'CLP',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value)

export default async function ProductosPage() {
  const payload = await getPayload({ config })
  const cmsQuery = await getCmsQueryOptions()
  const products = await payload.find({
    collection: 'products',
    depth: 1,
    limit: 20,
    locale: 'es',
    sort: 'title',
    ...cmsQuery,
  })

  return (
    <PageShell>
      <PageKicker>Productos</PageKicker>
      <PageTitle>Merch MBQB.</PageTitle>
      <PageLede>
        Catalogo simple de productos MBQB con detalles y contacto directo por WhatsApp para
        consultas.
      </PageLede>
      <PageGrid>
        {products.docs.map((product) => (
          <Card className="min-w-0" key={product.id} size="compact">
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
              <CardTitle>{product.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <RichSnippet body={product.body} />
              <Button asChild className="w-fit font-extrabold" variant="link">
                <Link href={`/productos/${product.slug}`}>Ver producto</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </PageGrid>
    </PageShell>
  )
}
