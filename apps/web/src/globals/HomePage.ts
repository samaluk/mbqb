import type { GlobalConfig } from 'payload'

import { publishedOrStaff } from '@/access/publishedOrStaff'
import { isEditorOrAdmin } from '@/access/roles'
import { buildPreviewUrl, draftVersions } from '@/lib/preview'
import { revalidateGlobalPublicContent } from '@/lib/publicContentPublishing'

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Home Page',
  admin: {
    livePreview: {
      url: ({ locale }) =>
        buildPreviewUrl({
          collection: 'home-page',
          locale,
          path: '/',
          slug: 'home-page',
        }),
    },
    preview: (_, { locale }) =>
      buildPreviewUrl({
        collection: 'home-page',
        locale,
        path: '/',
        slug: 'home-page',
      }),
  },
  access: {
    read: publishedOrStaff,
    update: isEditorOrAdmin,
  },
  versions: draftVersions,
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
