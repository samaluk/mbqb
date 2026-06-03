import type { CollectionConfig } from 'payload'

import { publishedOrStaff } from '@/access/publishedOrStaff'
import { isEditorOrAdmin } from '@/access/roles'
import { buildPreviewUrl, draftVersions } from '@/lib/preview'

export const Canchas: CollectionConfig = {
  slug: 'canchas',
  labels: {
    singular: 'Cancha',
    plural: 'Canchas',
  },
  admin: {
    defaultColumns: ['title', 'accessType', 'region', 'updatedAt'],
    livePreview: {
      url: ({ data, locale }) => {
        const slug = typeof data?.slug === 'string' ? data.slug : ''

        if (!slug) {
          return null
        }

        return buildPreviewUrl({
          collection: 'canchas',
          locale,
          path: `/canchas/${slug}`,
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
        collection: 'canchas',
        locale,
        path: `/canchas/${slug}`,
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
