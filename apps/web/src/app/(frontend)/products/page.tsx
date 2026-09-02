import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import { DocCard, PayloadCollectionListing } from '@/components/page'

export const metadata = { title: 'Products' }

export default function ProductsPage() {
  return (
    <PayloadCollectionListing
      collection="products"
      kicker="Products"
      lede="Simple catalog of community products with details and contact information for inquiries."
      renderItem={(product) => (
        <DocCard
          badges={
            <>
              <Badge variant="outline">{formatPrice(product.priceCLP)}</Badge>
              <Badge variant={product.stockStatus === 'available' ? 'secondary' : 'destructive'}>
                {product.stockStatus === 'available' ? 'Available' : 'Unavailable'}
              </Badge>
            </>
          }
          body={product.body}
          href={`/products/${product.slug}`}
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
          linkLabel="View product"
          title={product.title}
        />
      )}
      title="Products."
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
