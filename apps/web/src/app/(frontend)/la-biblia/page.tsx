import config from '@payload-config'
import Link from 'next/link'
import { cacheLife } from 'next/cache'
import { draftMode } from 'next/headers'
import { Suspense } from 'react'
import { getPayload } from 'payload'

import {
  PageGrid,
  PageKicker,
  PageLede,
  PageShell,
  PageTitle,
  RichSnippet,
} from '@/components/page'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button-variants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCmsQueryOptions, getPublishedCmsQueryOptions } from '@/lib/cmsQuery'
import { cn } from '@/lib/utils'
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

export default function LaBibliaPage() {
  return (
    <PageShell>
      <PageKicker>La Biblia</PageKicker>
      <PageTitle>Golf explicado sin vueltas.</PageTitle>
      <PageLede>
        Contenido evergreen para entender reglas, etiqueta, equipo, conceptos basicos y cultura
        golfistica.
      </PageLede>
      <Suspense fallback={null}>
        <LaBibliaArticles />
      </Suspense>
    </PageShell>
  )
}

async function LaBibliaArticles() {
  const { isEnabled: draft } = await draftMode()
  const articles = draft ? await getDraftLaBibliaArticles() : await getPublishedLaBibliaArticles()

  return (
    <PageGrid>
      {articles.map((article) => (
        <Card className="min-w-0" key={article.id} size="sm">
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{categoryLabels[article.category]}</Badge>
              <Badge variant="outline">{article.difficulty}</Badge>
            </div>
            <CardTitle>{article.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <RichSnippet body={article.body} />
            <Link
              className={cn(buttonVariants({ variant: 'link' }), 'w-fit font-extrabold')}
              href={`/la-biblia/${article.slug}`}
            >
              Leer articulo
            </Link>
          </CardContent>
        </Card>
      ))}
    </PageGrid>
  )
}

async function getPublishedLaBibliaArticles(): Promise<LaBibliaArticle[]> {
  'use cache'
  cacheLife('publicContent')

  try {
    const payload = await getPayload({ config })
    const articles = await payload.find({
      collection: 'la-biblia-articles',
      depth: 1,
      limit: 20,
      locale: 'es',
      sort: 'title',
      ...getPublishedCmsQueryOptions(),
    })

    return articles.docs
  } catch (error) {
    if (!isPayloadUnavailableError(error)) {
      console.error('Failed to load La Biblia articles', error)
    }

    return []
  }
}

async function getDraftLaBibliaArticles(): Promise<LaBibliaArticle[]> {
  // Payload boot and CMS query options are independent, so race them.
  const [payload, cmsQuery] = await Promise.all([getPayload({ config }), getCmsQueryOptions()])
  const articles = await payload.find({
    collection: 'la-biblia-articles',
    depth: 1,
    limit: 20,
    locale: 'es',
    sort: 'title',
    ...cmsQuery,
  })

  return articles.docs
}
