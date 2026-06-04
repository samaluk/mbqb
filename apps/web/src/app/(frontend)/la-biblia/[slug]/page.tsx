import config from '@payload-config'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

import { MetaPills, PageDetail, PageKicker, PageTitle, RichContent } from '@/components/page'
import { getCmsQueryOptions } from '@/lib/cmsQuery'

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
  const cmsQuery = await getCmsQueryOptions()
  const articles = await payload.find({
    collection: 'la-biblia-articles',
    depth: 1,
    limit: 1,
    locale: 'es',
    ...cmsQuery,
    where: {
      slug: {
        equals: slug,
      },
    },
  })
  const article = articles.docs[0]

  if (!article) notFound()

  return (
    <PageDetail>
      <Link className="back-link" href="/la-biblia">
        Volver a La Biblia
      </Link>
      <PageKicker>La Biblia</PageKicker>
      <PageTitle>{article.title}</PageTitle>
      <MetaPills items={[categoryLabels[article.category], article.difficulty]} />
      <RichContent body={article.body} />
    </PageDetail>
  )
}
