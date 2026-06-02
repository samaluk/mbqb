import type { GlobalConfig } from 'payload'

import { isEditorOrAdmin } from '@/access/roles'
import { revalidateGlobalPublicContent } from '@/lib/revalidatePublicContent'

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Home Page',
  access: {
    read: () => true,
    update: isEditorOrAdmin,
  },
  hooks: {
    afterChange: [() => revalidateGlobalPublicContent()],
  },
  fields: [
    {
      name: 'heroVideo',
      type: 'upload',
      label: 'Hero video',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'heroVideoAlt',
      type: 'text',
      label: 'Hero video alt text',
      defaultValue: 'Video destacado de Mas Bogeys Que Birdies',
      required: true,
    },
  ],
}
