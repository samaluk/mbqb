import type { CollectionConfig } from 'payload'

import { getPublicContentPublishing } from '@/lib/publicContentPublishing'

const publishing = getPublicContentPublishing('canchas')

export const Canchas: CollectionConfig = {
  slug: 'canchas',
  labels: {
    singular: 'Cancha',
    plural: 'Canchas',
  },
  admin: {
    ...publishing.admin,
    defaultColumns: ['title', 'accessType', 'region', 'updatedAt'],
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
      name: 'summary',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'body',
      type: 'richText',
      label: 'Body',
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
      name: 'holes',
      type: 'number',
      admin: {
        step: 1,
      },
      label: 'Holes',
    },
    {
      name: 'publicBookingUrl',
      type: 'text',
      label: 'Public booking URL',
    },
    {
      name: 'location',
      type: 'point',
      label: 'Location',
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
