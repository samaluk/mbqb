import type { CollectionConfig } from 'payload'

import { isEditorOrAdmin } from '@/access/roles'

export const LegacyPages: CollectionConfig = {
  slug: 'legacy-pages',
  admin: {
    defaultColumns: ['title', 'legacyKind', 'updatedAt'],
    useAsTitle: 'title',
  },
  access: {
    create: isEditorOrAdmin,
    delete: isEditorOrAdmin,
    read: isEditorOrAdmin,
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
      name: 'bodyHtml',
      type: 'textarea',
      label: 'Body HTML',
      localized: true,
      required: true,
    },
    {
      name: 'legacyKind',
      type: 'select',
      defaultValue: 'page',
      options: ['page', 'hub', 'bogeyficador'],
      required: true,
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
