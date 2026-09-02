import { Badge } from '@/components/ui/badge'
import { DocCard, PayloadCollectionListing } from '@/components/page'
import { laBibliaCategoryLabels } from '@/lib/laBiblia'

export const metadata = { title: 'La Biblia' }

export default function LaBibliaPage() {
  return (
    <PayloadCollectionListing
      collection="la-biblia-articles"
      kicker="La Biblia"
      lede="Contenido evergreen para entender reglas, etiqueta, equipo, conceptos basicos y cultura golfistica."
      renderItem={(article) => (
        <DocCard
          badges={
            <>
              <Badge variant="outline">{laBibliaCategoryLabels[article.category]}</Badge>
              <Badge variant="outline">{article.difficulty}</Badge>
            </>
          }
          body={article.body}
          href={`/la-biblia/${article.slug}`}
          linkLabel="Leer articulo"
          title={article.title}
        />
      )}
      title="Golf explicado sin vueltas."
    />
  )
}
