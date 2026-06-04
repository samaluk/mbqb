import type { CollectionConfig } from 'payload'

import { getPublicContentPublishing } from '@/lib/publicContentPublishing'

const publishing = getPublicContentPublishing('products')

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    ...publishing.admin,
    defaultColumns: ['title', 'priceCLP', 'stockStatus', 'updatedAt'],
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
