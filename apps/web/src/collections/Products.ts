import type { CollectionConfig } from 'payload'

import { publishedOrStaff } from '@/access/publishedOrStaff'
import { isEditorOrAdmin } from '@/access/roles'
import { buildPreviewUrl, draftVersions } from '@/lib/preview'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    defaultColumns: ['title', 'priceCLP', 'stockStatus', 'updatedAt'],
    livePreview: {
      url: ({ data, locale }) => {
        const slug = typeof data?.slug === 'string' ? data.slug : ''

        if (!slug) {
          return null
        }

        return buildPreviewUrl({
          collection: 'products',
          locale,
          path: `/productos/${slug}`,
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
        collection: 'products',
        locale,
        path: `/productos/${slug}`,
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
      name: 'bodyHtml',
      type: 'textarea',
      label: 'Body HTML',
      localized: true,
      required: true,
    },
    {
      name: 'priceCLP',
      type: 'number',
      label: 'Price CLP',
      required: true,
    },
    {
      name: 'stockStatus',
      type: 'select',
      defaultValue: 'available',
      options: [
        {
          label: 'Available',
          value: 'available',
        },
        {
          label: 'Unavailable',
          value: 'unavailable',
        },
      ],
      required: true,
    },
    {
      name: 'imageUrl',
      type: 'text',
      label: 'Source image URL',
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
