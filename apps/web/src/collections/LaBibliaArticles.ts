import type { CollectionConfig } from 'payload'

import { getPublicContentPublishing } from '@/lib/publicContentPublishing'

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
  versions: publishing.versions,
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      index: true,
      required: true,
      unique: true,
    },
    {
      name: 'body',
      type: 'richText',
      label: 'Body',
      localized: true,
      required: true,
    },
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
