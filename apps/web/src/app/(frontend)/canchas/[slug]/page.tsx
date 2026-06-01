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
    <article className="page-shell detail-page">
      <Link className="back-link" href="/canchas">
        Volver a canchas
      </Link>
      <div className="eyebrow">Cancha</div>
      <h1>{cancha.title}</h1>
      <div className="card-meta">
        <span>{canchaAccessLabels[cancha.accessType]}</span>
        {cancha.region ? <span>{cancha.region}</span> : null}
        {cancha.city ? <span>{cancha.city}</span> : null}
      </div>
      {cancha.summary ? <p className="lead">{cancha.summary}</p> : null}
      <a
        className="button secondary detail-map-link"
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
