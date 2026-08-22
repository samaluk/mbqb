import Link from 'next/link'
import { draftMode } from 'next/headers'
import { Suspense } from 'react'

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
import { laBibliaCategoryLabels } from '@/lib/laBiblia'
import { cn } from '@/lib/utils'
import { getDraftPayloadDocs, getPublishedPayloadDocs } from '@/lib/payloadBySlug'
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
  const articles = draft
    ? await getDraftPayloadDocs('la-biblia-articles')
    : await getPublishedPayloadDocs('la-biblia-articles')

  return (
    <PageGrid>
      {articles.map((article) => (
        <Card className="min-w-0" key={article.id} size="sm">
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{laBibliaCategoryLabels[article.category]}</Badge>
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
