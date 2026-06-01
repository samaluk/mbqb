import config from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
    <section className="mx-auto min-h-[calc(100vh-86px)] w-[min(1120px,calc(100%_-_48px))] py-14 pb-24 max-[760px]:min-h-[calc(100vh-67px)] max-[760px]:w-[min(calc(100%_-_24px),1120px)] max-[760px]:py-7 max-[760px]:pb-14">
      <div className="text-sm font-extrabold uppercase text-green max-[760px]:text-xs">
        La Biblia
      </div>
      <h1 className="my-3 max-w-[780px] text-[clamp(40px,6vw,72px)] leading-none max-[760px]:my-2 max-[760px]:mb-3 max-[760px]:text-[clamp(34px,11vw,48px)]">
        Golf explicado sin vueltas.
      </h1>
      <p className="m-0 max-w-[640px] text-xl text-muted max-[760px]:text-base max-[760px]:leading-[1.45]">
        Contenido evergreen para entender reglas, etiqueta, equipo, conceptos basicos y cultura
        golfistica.
      </p>
      <div className="mt-9 grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-[18px] max-[760px]:mt-[22px] max-[760px]:grid-cols-1 max-[760px]:gap-2.5">
        {articles.docs.map((article) => (
          <Card className="min-w-0" key={article.id}>
            <CardHeader>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{categoryLabels[article.category]}</Badge>
                <Badge variant="outline">{article.difficulty}</Badge>
              </div>
              <CardTitle className="text-2xl leading-[1.15] max-[760px]:text-xl">
                {article.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 max-[760px]:gap-[9px]">
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
