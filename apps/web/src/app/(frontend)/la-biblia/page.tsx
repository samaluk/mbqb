import config from '@payload-config'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

const categoryLabels = {
  canchas: 'Canchas',
  'cultura-golf': 'Cultura golf',
  'diccionario-golfistico': 'Diccionario golfistico',
  equipo: 'Equipo',
  'primeros-pasos': 'Primeros pasos',
  'reglas-y-etiqueta': 'Reglas y etiqueta',
  'tecnica-basica': 'Tecnica basica',
}

export default async function LaBibliaPage() {
  const payload = await getPayload({ config })
  const articles = await payload.find({
    collection: 'la-biblia-articles',
    depth: 0,
    limit: 20,
    locale: 'es',
    sort: 'title',
  })

  return (
    <section className="page-shell simple-page">
      <div className="eyebrow">La Biblia</div>
      <h1>Golf explicado sin vueltas.</h1>
      <p>
        Contenido evergreen para entender reglas, etiqueta, equipo, conceptos basicos y cultura
        golfistica.
      </p>
      <div className="content-grid">
        {articles.docs.map((article) => (
          <article className="content-card" key={article.id}>
            <div className="card-meta">
              <span>{categoryLabels[article.category]}</span>
              <span>{article.difficulty}</span>
            </div>
            <h2>{article.title}</h2>
            <div
              className="rich-snippet"
              dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
            />
            <a href={article.sourceUrl}>Leer original</a>
          </article>
        ))}
      </div>
    </section>
  )
}
