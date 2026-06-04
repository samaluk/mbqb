import type { CollectionConfig } from 'payload'

import { publishedOrStaff } from '@/access/publishedOrStaff'
import { isEditorOrAdmin } from '@/access/roles'
import { buildPreviewUrl, draftVersions } from '@/lib/preview'

export const LaBibliaArticles: CollectionConfig = {
  slug: 'la-biblia-articles',
  labels: {
    singular: 'La Biblia Article',
    plural: 'La Biblia Articles',
  },
  admin: {
    defaultColumns: ['title', 'category', 'difficulty', 'reviewedAt'],
    livePreview: {
      url: ({ data, locale }) => {
        const slug = typeof data?.slug === 'string' ? data.slug : ''

        if (!slug) {
          return null
        }

        return buildPreviewUrl({
          collection: 'la-biblia-articles',
          locale,
          path: `/la-biblia/${slug}`,
          slug,
        })
      },
    },
    preview: (data, { locale }) => {
      const slug = typeof data?.slug === 'string' ? data.slug : ''

      if (!slug) {
        return null
      }

      return buildPreviewUrl({
        collection: 'la-biblia-articles',
        locale,
        path: `/la-biblia/${slug}`,
        slug,
      })
    },
    useAsTitle: 'title',
  },
  access: {
    create: isEditorOrAdmin,
    delete: isEditorOrAdmin,
    read: publishedOrStaff,
    update: isEditorOrAdmin,
  },
  versions: draftVersions,
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
