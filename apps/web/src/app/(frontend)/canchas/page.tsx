import config from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'

import { canchaAccessLabels, getGoogleMapsUrl, type CanchaMapItem } from '@/lib/canchas'

import { CanchasMapLoader } from './CanchasMapLoader'

export const dynamic = 'force-dynamic'

export default async function CanchasPage() {
  const payload = await getPayload({ config })
  const canchas = await payload.find({
    collection: 'canchas',
    depth: 0,
    limit: 50,
    locale: 'es',
    sort: 'title',
  })
  const canchaDocs = canchas.docs as CanchaMapItem[]

  return (
    <section className="page-shell simple-page">
      <div className="eyebrow">Canchas</div>
      <h1>Donde jugar golf en Chile.</h1>
      <p>
        Guia editorial de canchas jugables, tipos de acceso, precios referenciales y datos utiles
        para planificar una salida.
      </p>
      <div className="canchas-layout">
        <CanchasMapLoader canchas={canchaDocs} />
        <div className="canchas-list" aria-label="Listado de canchas">
          {canchaDocs.map((cancha, index) => (
            <article className="content-card cancha-card" key={cancha.id}>
              <div className="cancha-card-header">
                <span className="map-index">{index + 1}</span>
                <div className="card-meta">
                  <span>{canchaAccessLabels[cancha.accessType]}</span>
                  {cancha.region ? <span>{cancha.region}</span> : null}
                  {cancha.city ? <span>{cancha.city}</span> : null}
                </div>
              </div>
              <h2>{cancha.title}</h2>
              {cancha.summary ? <p>{cancha.summary}</p> : null}
              <div className="card-actions">
                <Link href={`/canchas/${cancha.slug}`}>Ver ficha</Link>
                <a href={getGoogleMapsUrl(cancha)} rel="noreferrer" target="_blank">
                  Google Maps
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
