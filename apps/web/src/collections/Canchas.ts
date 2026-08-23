import type { CollectionConfig } from 'payload'

import { getPublicContentPublishing } from '@/lib/publicContentPublishing'

import { localizedRichBodyField, localizedTitleField, uniqueSlugField } from './fields'

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
  hooks: publishing.hooks,
  versions: publishing.versions,
  fields: [
    localizedTitleField(),
    uniqueSlugField(),
    {
      name: 'summary',
      type: 'textarea',
      localized: true,
    },
    localizedRichBodyField(),
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
