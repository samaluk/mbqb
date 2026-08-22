import config from '@payload-config'
import Link from 'next/link'
import { cacheLife } from 'next/cache'
import { draftMode } from 'next/headers'
import { Suspense } from 'react'
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
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCmsQueryOptions, getPublishedCmsQueryOptions } from '@/lib/cmsQuery'
import { cn } from '@/lib/utils'
import { isPayloadUnavailableError } from '@/lib/payloadUnavailableError'
import type { Product } from '@/payload-types'

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
  const products = draft ? await getDraftProducts() : await getPublishedProducts()

  return (
    <PageGrid>
      {products.map((product) => (
        <Card className="min-w-0" key={product.id} size="sm">
          {product.imageUrl ? (
            <img
              alt=""
              className="aspect-5/3 w-full object-cover max-[760px]:aspect-video"
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

async function getPublishedProducts(): Promise<Product[]> {
  'use cache'
  cacheLife('publicContent')

  try {
    const payload = await getPayload({ config })
    const products = await payload.find({
      collection: 'products',
      depth: 1,
      limit: 20,
      locale: 'es',
      sort: 'title',
      ...getPublishedCmsQueryOptions(),
    })

    return products.docs
  } catch (error) {
    if (!isPayloadUnavailableError(error)) {
      console.error('Failed to load products', error)
    }

    return []
  }
}

async function getDraftProducts(): Promise<Product[]> {
  // Payload boot and CMS query options are independent, so race them.
  const [payload, cmsQuery] = await Promise.all([getPayload({ config }), getCmsQueryOptions()])
  const products = await payload.find({
    collection: 'products',
    depth: 1,
    limit: 20,
    locale: 'es',
    sort: 'title',
    ...cmsQuery,
  })

  return products.docs
}
