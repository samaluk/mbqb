import config from '@payload-config'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { canchaAccessLabels, getGoogleMapsUrl, type CanchaMapItem } from '@/lib/canchas'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export default async function CanchaDetailPage({ params }: PageProps) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const canchas = await payload.find({
    collection: 'canchas',
    depth: 0,
    limit: 1,
    locale: 'es',
    where: {
      slug: {
        equals: slug,
      },
    },
  })
  const cancha = canchas.docs[0]

  if (!cancha) notFound()

  const canchaItem = cancha as CanchaMapItem

  return (
    <article className="mx-auto grid w-[min(1120px,calc(100%_-_48px))] gap-[18px] py-14 pb-24 max-[760px]:w-[min(calc(100%_-_24px),1120px)] max-[760px]:py-7 max-[760px]:pb-14">
      <Link className="w-fit text-[15px] font-extrabold text-green no-underline" href="/canchas">
        Volver a canchas
      </Link>
      <div className="text-sm font-extrabold uppercase text-green max-[760px]:text-xs">
        Cancha
      </div>
      <h1 className="my-3 mb-0 max-w-[900px] text-[clamp(38px,6vw,74px)] leading-none max-[760px]:my-2 max-[760px]:mb-3 max-[760px]:text-[clamp(34px,11vw,48px)]">
        {cancha.title}
      </h1>
      <div className="flex flex-wrap gap-2 text-[13px] font-extrabold uppercase text-green max-[760px]:gap-1.5 max-[760px]:text-[11px]">
        <span className="rounded-full border border-green/20 px-2 py-[3px] max-[760px]:px-[7px] max-[760px]:py-0.5">
          {canchaAccessLabels[cancha.accessType]}
        </span>
        {cancha.region ? (
          <span className="rounded-full border border-green/20 px-2 py-[3px] max-[760px]:px-[7px] max-[760px]:py-0.5">
            {cancha.region}
          </span>
        ) : null}
        {cancha.city ? (
          <span className="rounded-full border border-green/20 px-2 py-[3px] max-[760px]:px-[7px] max-[760px]:py-0.5">
            {cancha.city}
          </span>
        ) : null}
      </div>
      {cancha.summary ? (
        <p className="max-w-[780px] text-muted max-[760px]:text-base max-[760px]:leading-[1.45]">
          {cancha.summary}
        </p>
      ) : null}
      <a
        className="inline-flex min-h-[46px] w-fit items-center justify-center rounded-md border border-green bg-transparent px-[18px] font-bold text-green no-underline max-[760px]:min-h-[42px] max-[760px]:px-3.5"
        href={getGoogleMapsUrl(canchaItem)}
        rel="noreferrer"
        target="_blank"
      >
        Abrir en Google Maps
      </a>
      <div className="rich-content" dangerouslySetInnerHTML={{ __html: cancha.bodyHtml }} />
    </article>
  )
}
