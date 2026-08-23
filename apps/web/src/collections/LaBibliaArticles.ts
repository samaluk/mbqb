import type { CollectionConfig } from 'payload'

import { getPublicContentPublishing } from '@/lib/publicContentPublishing'

import { localizedRichBodyField, localizedTitleField, uniqueSlugField } from './fields'

const publishing = getPublicContentPublishing('la-biblia-articles')

export const LaBibliaArticles: CollectionConfig = {
  slug: 'la-biblia-articles',
  labels: {
    singular: 'La Biblia Article',
    plural: 'La Biblia Articles',
  },
  admin: {
    ...publishing.admin,
    defaultColumns: ['title', 'category', 'difficulty', 'reviewedAt'],
    useAsTitle: 'title',
  },
  access: publishing.access,
  hooks: publishing.hooks,
  versions: publishing.versions,
  fields: [
    localizedTitleField(),
    uniqueSlugField(),
    localizedRichBodyField(),
    {
      name: 'category',
      type: 'select',
      defaultValue: 'equipo',
      options: [
        'primeros-pasos',
        'reglas-y-etiqueta',
        'equipo',
        'canchas',
        'tecnica-basica',
        'diccionario-golfistico',
        'cultura-golf',
      ],
      required: true,
    },
    {
      name: 'difficulty',
      type: 'select',
      defaultValue: 'principiante',
      options: ['principiante', 'intermedio', 'avanzado'],
      required: true,
    },
    {
      name: 'reviewedAt',
      type: 'date',
      label: 'Reviewed at',
    },
    {
      name: 'sourceUrl',
      type: 'text',
      label: 'Original URL',
      required: true,
    },
    {
      name: 'sourceUpdatedAt',
      type: 'date',
      label: 'Original updated at',
    },
  ],
}
