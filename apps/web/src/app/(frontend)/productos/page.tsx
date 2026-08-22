import Link from 'next/link'
import Image from 'next/image'
import { draftMode } from 'next/headers'
import { Suspense } from 'react'

import {
  PageGrid,
  PageKicker,
  PageLede,
  PageShell,
  PageTitle,
  RichSnippet,
} from '@/components/page'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button-variants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDraftPayloadDocs, getPublishedPayloadDocs } from '@/lib/payloadBySlug'
import { cn } from '@/lib/utils'

// Module scope: constructing an Intl formatter loads locale data, so build
// the CLP currency formatter once instead of per render.
const clpFormatter = new Intl.NumberFormat('es-CL', {
  currency: 'CLP',
  maximumFractionDigits: 0,
  style: 'currency',
})

const formatPrice = (value: number) => clpFormatter.format(value)

export default function ProductosPage() {
  return (
    <PageShell>
      <PageKicker>Productos</PageKicker>
      <PageTitle>Merch MBQB.</PageTitle>
      <PageLede>
        Catalogo simple de productos MBQB con detalles y contacto directo por WhatsApp para
        consultas.
      </PageLede>
      <Suspense fallback={null}>
        <ProductosGrid />
      </Suspense>
    </PageShell>
  )
}

async function ProductosGrid() {
  const { isEnabled: draft } = await draftMode()
  const products = draft
    ? await getDraftPayloadDocs('products')
    : await getPublishedPayloadDocs('products')

  return (
    <PageGrid>
      {products.map((product) => (
        <Card className="min-w-0" key={product.id} size="sm">
          {product.imageUrl ? (
            // imageUrl is staff-entered and can point at arbitrary external
            // hosts, so the optimizer is skipped (unoptimized) — next/image
            // still contributes explicit dimensions, lazy loading, and layout
            // stability. Intrinsic size matches the 5:3 display aspect.
            <Image
              alt=""
              className="aspect-5/3 w-full object-cover max-[760px]:aspect-video"
              height={600}
              src={product.imageUrl}
              unoptimized
              width={1000}
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
            <Link
              className={cn(buttonVariants({ variant: 'link' }), 'w-fit font-extrabold')}
              href={`/productos/${product.slug}`}
            >
              Ver producto
            </Link>
          </CardContent>
        </Card>
      ))}
    </PageGrid>
  )
}
