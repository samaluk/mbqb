import type { CollectionConfig } from 'payload'

import { isEditorOrAdmin } from '@/access/roles'

export const Canchas: CollectionConfig = {
  slug: 'canchas',
  labels: {
    singular: 'Cancha',
    plural: 'Canchas',
  },
  admin: {
    defaultColumns: ['title', 'accessType', 'region', 'updatedAt'],
    useAsTitle: 'title',
  },
  access: {
    create: isEditorOrAdmin,
    delete: isEditorOrAdmin,
    read: () => true,
    update: isEditorOrAdmin,
  },
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
      name: 'summary',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'bodyHtml',
      type: 'textarea',
      label: 'Body HTML',
      localized: true,
      required: true,
    },
    {
      name: 'accessType',
      type: 'select',
      defaultValue: 'unknown',
      options: [
        {
          label: 'Pay and Play',
          value: 'pay-and-play',
        },
        {
          label: 'Private',
          value: 'private',
        },
        {
          label: 'Restricted',
          value: 'restricted',
        },
        {
          label: 'Unknown',
          value: 'unknown',
        },
      ],
      required: true,
    },
    {
      name: 'region',
      type: 'text',
    },
    {
      name: 'city',
      type: 'text',
      label: 'City / comuna',
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
