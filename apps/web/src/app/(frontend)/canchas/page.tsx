import config from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

const accessLabels = {
  private: 'Privada',
  'pay-and-play': 'Pay and play',
  restricted: 'Restringida',
  unknown: 'Por confirmar',
}

export default async function CanchasPage() {
  const payload = await getPayload({ config })
  const canchas = await payload.find({
    collection: 'canchas',
    depth: 0,
    limit: 50,
    locale: 'es',
    sort: 'title',
  })

  return (
    <section className="page-shell simple-page">
      <div className="eyebrow">Canchas</div>
      <h1>Donde jugar golf en Chile.</h1>
      <p>
        Guia editorial de canchas jugables, tipos de acceso, precios referenciales y datos utiles
        para planificar una salida.
      </p>
      <div className="content-grid">
        {canchas.docs.map((cancha) => (
          <article className="content-card" key={cancha.id}>
            <div className="card-meta">
              <span>{accessLabels[cancha.accessType]}</span>
              {cancha.region ? <span>{cancha.region}</span> : null}
            </div>
            <h2>{cancha.title}</h2>
            {cancha.summary ? <p>{cancha.summary}</p> : null}
            <Link href={`/canchas/${cancha.slug}`}>Ver ficha</Link>
          </article>
        ))}
      </div>
    </section>
  )
}
