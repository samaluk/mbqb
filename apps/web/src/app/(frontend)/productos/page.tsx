import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import { DocCard, PayloadCollectionListing } from '@/components/page'

export const metadata = { title: 'Productos' }

export default function ProductosPage() {
  return (
    <PayloadCollectionListing
      collection="products"
      kicker="Productos"
      lede="Catalogo simple de productos con detalles y contacto directo por WhatsApp para consultas."
      renderItem={(product) => (
        <DocCard
          badges={
            <>
              <Badge variant="outline">{formatPrice(product.priceCLP)}</Badge>
              <Badge variant={product.stockStatus === 'available' ? 'secondary' : 'destructive'}>
                {product.stockStatus === 'available' ? 'Disponible' : 'Agotado'}
              </Badge>
            </>
          }
          body={product.body}
          href={`/productos/${product.slug}`}
          image={
            product.imageUrl ? (
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
            ) : null
          }
          linkLabel="Ver producto"
          title={product.title}
        />
      )}
      title="Productos."
    />
  )
}

// Module scope: constructing an Intl formatter loads locale data, so build
// the CLP currency formatter once instead of per render.
const clpFormatter = new Intl.NumberFormat('es-CL', {
  currency: 'CLP',
  maximumFractionDigits: 0,
  style: 'currency',
})

const formatPrice = (value: number) => clpFormatter.format(value)
