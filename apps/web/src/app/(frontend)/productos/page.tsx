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
          <article
            className="grid min-w-0 content-start gap-3 rounded-lg border border-line bg-white-soft p-[18px] max-[760px]:gap-[9px] max-[760px]:p-[13px]"
            key={product.id}
          >
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt=""
                className="aspect-4/3 w-full rounded-md object-cover"
                src={product.imageUrl}
              />
            ) : null}
            <div className="flex flex-wrap gap-2 text-[13px] font-extrabold uppercase text-green max-[760px]:gap-1.5 max-[760px]:text-[11px]">
              <span className="rounded-full border border-green/20 px-2 py-[3px] max-[760px]:px-[7px] max-[760px]:py-0.5">
                {formatPrice(product.priceCLP)}
              </span>
              <span className="rounded-full border border-green/20 px-2 py-[3px] max-[760px]:px-[7px] max-[760px]:py-0.5">
                {product.stockStatus === 'available' ? 'Disponible' : 'Agotado'}
              </span>
            </div>
            <h2 className="m-0 text-2xl leading-[1.15] max-[760px]:text-xl">
              {product.title}
            </h2>
            <div
              className="rich-snippet max-w-none text-base text-muted max-[760px]:text-sm max-[760px]:leading-[1.4]"
              dangerouslySetInnerHTML={{ __html: product.bodyHtml }}
            />
            <Link
              className="text-[15px] font-extrabold text-green"
              href={`/productos/${product.slug}`}
            >
              Ver producto
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
