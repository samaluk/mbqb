import config from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
    <section className="mx-auto min-h-[calc(100vh-86px)] w-[min(1120px,calc(100%_-_48px))] py-14 pb-24 max-[760px]:min-h-[calc(100vh-67px)] max-[760px]:w-[min(calc(100%_-_24px),1120px)] max-[760px]:py-7 max-[760px]:pb-14">
      <div className="text-sm font-extrabold uppercase text-green max-[760px]:text-xs">
        Productos
      </div>
      <h1 className="my-3 max-w-[780px] text-[clamp(40px,6vw,72px)] leading-none max-[760px]:my-2 max-[760px]:mb-3 max-[760px]:text-[clamp(34px,11vw,48px)]">
        Merch MBQB.
      </h1>
      <p className="m-0 max-w-[640px] text-xl text-muted max-[760px]:text-base max-[760px]:leading-[1.45]">
        Catalogo simple de productos MBQB con detalles y contacto directo por WhatsApp para
        consultas.
      </p>
      <div className="mt-9 grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-[18px] max-[760px]:mt-[22px] max-[760px]:grid-cols-1 max-[760px]:gap-2.5">
        {products.docs.map((product) => (
          <Card className="min-w-0" key={product.id}>
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="" className="aspect-4/3 w-full object-cover" src={product.imageUrl} />
            ) : null}
            <CardHeader>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{formatPrice(product.priceCLP)}</Badge>
                <Badge variant={product.stockStatus === 'available' ? 'secondary' : 'destructive'}>
                  {product.stockStatus === 'available' ? 'Disponible' : 'Agotado'}
                </Badge>
              </div>
              <CardTitle className="text-2xl leading-[1.15] max-[760px]:text-xl">
                {product.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 max-[760px]:gap-[9px]">
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
