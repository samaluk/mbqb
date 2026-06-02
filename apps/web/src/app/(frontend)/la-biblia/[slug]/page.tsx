import config from '@payload-config'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

const categoryLabels = {
  canchas: 'Canchas',
  'cultura-golf': 'Cultura golf',
  'diccionario-golfistico': 'Diccionario golfistico',
  equipo: 'Equipo',
  'primeros-pasos': 'Primeros pasos',
  'reglas-y-etiqueta': 'Reglas y etiqueta',
  'tecnica-basica': 'Tecnica basica',
}

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const articles = await payload.find({
    collection: 'la-biblia-articles',
    depth: 0,
    limit: 1,
    locale: 'es',
    where: {
      slug: {
        equals: slug,
      },
    },
  })
  const article = articles.docs[0]

  if (!article) notFound()

  return (
    <article className="page-shell detail-shell">
      <Link className="w-fit text-[15px] font-extrabold text-green no-underline" href="/la-biblia">
        Volver a La Biblia
      </Link>
      <div className="page-kicker">La Biblia</div>
      <h1 className="page-title">{article.title}</h1>
      <div className="meta-pills">
        <span>{categoryLabels[article.category]}</span>
        <span>{article.difficulty}</span>
      </div>
      <div className="rich-content" dangerouslySetInnerHTML={{ __html: article.bodyHtml }} />
    </article>
  )
}
