import type { LaBibliaArticle } from '@/payload-types'

/** Spanish display labels for La Biblia article categories, keyed by the
 * collection's `category` select values. Shared by the listing and detail
 * routes so both render identical vocabulary. */
export const laBibliaCategoryLabels = {
  canchas: 'Canchas',
  'cultura-golf': 'Cultura golf',
  'diccionario-golfistico': 'Diccionario golfistico',
  equipo: 'Equipo',
  'primeros-pasos': 'Primeros pasos',
  'reglas-y-etiqueta': 'Reglas y etiqueta',
  'tecnica-basica': 'Tecnica basica',
} satisfies Record<LaBibliaArticle['category'], string>
