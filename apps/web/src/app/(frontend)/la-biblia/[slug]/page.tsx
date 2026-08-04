import config from '@payload-config'
import Link from 'next/link'
import { cacheLife } from 'next/cache'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import { Suspense } from 'react'
import { getPayload } from 'payload'

import { MetaPills, PageDetail, PageKicker, PageTitle, RichContent } from '@/components/page'
import { getCmsQueryOptions, getPublishedCmsQueryOptions } from '@/lib/cmsQuery'
import { isPayloadUnavailableError } from '@/lib/payloadUnavailableError'
import type { LaBibliaArticle } from '@/payload-types'

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
    <Suspense fallback={null}>
      <ArticleDetailContent params={params} />
    </Suspense>
  )
}

async function ArticleDetailContent({ params }: PageProps) {
  const { slug } = await params
  const { isEnabled: draft } = await draftMode()
  const article = draft ? await getDraftArticle(slug) : await getPublishedArticle(slug)

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

async function getPublishedArticle(slug: string): Promise<LaBibliaArticle | null> {
  'use cache'
  cacheLife('publicContent')

  try {
    const payload = await getPayload({ config })
    const articles = await payload.find({
      collection: 'la-biblia-articles',
      depth: 1,
      limit: 1,
      locale: 'es',
      ...getPublishedCmsQueryOptions(),
      where: {
        slug: {
          equals: slug,
        },
      },
    })

    return articles.docs[0] ?? null
  } catch (error) {
    if (!isPayloadUnavailableError(error)) {
      console.error(`Failed to load La Biblia article "${slug}"`, error)
    }

    return null
  }
}

async function getDraftArticle(slug: string): Promise<LaBibliaArticle | null> {
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

  return articles.docs[0] ?? null
}
