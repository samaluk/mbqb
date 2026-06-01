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
    <article className="page-shell detail-shell">
      <Link className="w-fit text-[15px] font-extrabold text-green no-underline" href="/canchas">
        Volver a canchas
      </Link>
      <div className="page-kicker">Cancha</div>
      <h1 className="page-title">{cancha.title}</h1>
      <div className="meta-pills">
        <span>{canchaAccessLabels[cancha.accessType]}</span>
        {cancha.region ? (
          <span>{cancha.region}</span>
        ) : null}
        {cancha.city ? <span>{cancha.city}</span> : null}
      </div>
      {cancha.summary ? (
        <p className="page-lede max-w-[780px]">{cancha.summary}</p>
      ) : null}
      <a
        className="inline-flex min-h-10 w-fit items-center justify-center rounded-md border border-green bg-transparent px-4 font-bold text-green no-underline"
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
