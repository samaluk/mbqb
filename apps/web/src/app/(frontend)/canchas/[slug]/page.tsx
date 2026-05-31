import config from '@payload-config'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

const accessLabels = {
  private: 'Privada',
  'pay-and-play': 'Pay and play',
  restricted: 'Restringida',
  unknown: 'Por confirmar',
}

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

  return (
    <article className="page-shell detail-page">
      <Link className="back-link" href="/canchas">
        Volver a canchas
      </Link>
      <div className="eyebrow">Cancha</div>
      <h1>{cancha.title}</h1>
      <div className="card-meta">
        <span>{accessLabels[cancha.accessType]}</span>
        {cancha.region ? <span>{cancha.region}</span> : null}
        {cancha.city ? <span>{cancha.city}</span> : null}
      </div>
      {cancha.summary ? <p className="lead">{cancha.summary}</p> : null}
      <div className="rich-content" dangerouslySetInnerHTML={{ __html: cancha.bodyHtml }} />
    </article>
  )
}
