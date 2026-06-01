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
    <article className="mx-auto grid w-[min(1120px,calc(100%_-_48px))] gap-[18px] py-14 pb-24 max-[760px]:w-[min(calc(100%_-_24px),1120px)] max-[760px]:py-7 max-[760px]:pb-14">
      <Link className="w-fit text-[15px] font-extrabold text-green no-underline" href="/productos">
        Volver a productos
      </Link>
      <div className="text-sm font-extrabold uppercase text-green max-[760px]:text-xs">
        Producto
      </div>
      <h1 className="my-3 mb-0 max-w-[900px] text-[clamp(38px,6vw,74px)] leading-none max-[760px]:my-2 max-[760px]:mb-3 max-[760px]:text-[clamp(34px,11vw,48px)]">
        {product.title}
      </h1>
      <div className="flex flex-wrap gap-2 text-[13px] font-extrabold uppercase text-green max-[760px]:gap-1.5 max-[760px]:text-[11px]">
        <span className="rounded-full border border-green/20 px-2 py-[3px] max-[760px]:px-[7px] max-[760px]:py-0.5">
          {formatPrice(product.priceCLP)}
        </span>
        <span className="rounded-full border border-green/20 px-2 py-[3px] max-[760px]:px-[7px] max-[760px]:py-0.5">
          {product.stockStatus === 'available' ? 'Disponible' : 'Agotado'}
        </span>
      </div>
      {product.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className="aspect-4/3 h-auto w-[min(100%,720px)] rounded-lg object-cover"
          src={product.imageUrl}
        />
      ) : null}
      <div className="rich-content" dangerouslySetInnerHTML={{ __html: product.bodyHtml }} />
    </article>
  )
}
