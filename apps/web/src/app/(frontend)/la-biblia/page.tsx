import config from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
    <section className="page-shell">
      <div className="page-kicker">La Biblia</div>
      <h1 className="page-title">Golf explicado sin vueltas.</h1>
      <p className="page-lede">
        Contenido evergreen para entender reglas, etiqueta, equipo, conceptos basicos y cultura
        golfistica.
      </p>
      <div className="compact-grid">
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
              <div
                className="rich-snippet max-w-none text-base text-muted max-[760px]:text-sm max-[760px]:leading-[1.4]"
                dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
              />
              <Button asChild className="w-fit font-extrabold" variant="link">
                <Link href={`/la-biblia/${article.slug}`}>Leer articulo</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
