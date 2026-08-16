import Link from 'next/link'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { MetaPills, PageDetail, PageKicker, PageTitle, RichContent } from '@/components/page'
import { getDraftPayloadDocBySlug, getPublishedPayloadDocBySlug } from '@/lib/payloadBySlug'

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

export default function ArticleDetailPage({ params }: PageProps) {
  return (
    <PageDetail>
      <Link className="back-link" data-testid="article-detail-back-link" href="/la-biblia">
        Volver a La Biblia
      </Link>
      <PageKicker>La Biblia</PageKicker>
      <Suspense fallback={null}>
        <ArticleDetailContent params={params} />
      </Suspense>
    </PageDetail>
  )
}

async function ArticleDetailContent({ params }: PageProps) {
  const { slug } = await params
  const { isEnabled: draft } = await draftMode()
  const article = draft
    ? await getDraftPayloadDocBySlug('la-biblia-articles', slug)
    : await getPublishedPayloadDocBySlug('la-biblia-articles', slug)

  if (!article) notFound()

  return (
    <>
      <PageTitle data-testid="article-detail-title">{article.title}</PageTitle>
      <MetaPills items={[categoryLabels[article.category], article.difficulty]} />
      <RichContent body={article.body} />
    </>
  )
}
