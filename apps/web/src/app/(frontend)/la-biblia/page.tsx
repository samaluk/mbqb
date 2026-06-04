import config from '@payload-config'
import Link from 'next/link'
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
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

export default async function LaBibliaPage() {
  const payload = await getPayload({ config })
  const cmsQuery = await getCmsQueryOptions()
  const articles = await payload.find({
    collection: 'la-biblia-articles',
    depth: 1,
    limit: 20,
    locale: 'es',
    sort: 'title',
    ...cmsQuery,
  })

  return (
    <PageShell>
      <PageKicker>La Biblia</PageKicker>
      <PageTitle>Golf explicado sin vueltas.</PageTitle>
      <PageLede>
        Contenido evergreen para entender reglas, etiqueta, equipo, conceptos basicos y cultura
        golfistica.
      </PageLede>
      <PageGrid>
        {articles.docs.map((article) => (
          <Card className="min-w-0" key={article.id} size="compact">
            <CardHeader>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{categoryLabels[article.category]}</Badge>
                <Badge variant="outline">{article.difficulty}</Badge>
              </div>
              <CardTitle>{article.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <RichSnippet body={article.body} />
              <Button asChild className="w-fit font-extrabold" variant="link">
                <Link href={`/la-biblia/${article.slug}`}>Leer articulo</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </PageGrid>
    </PageShell>
  )
}
