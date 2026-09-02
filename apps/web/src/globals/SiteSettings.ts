import type { GlobalConfig } from 'payload'

import { isEditorOrAdmin } from '@/access/roles'
import { revalidateGlobalPublicContent } from '@/lib/publicContentPublishing'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: {
    read: () => true,
    update: isEditorOrAdmin,
  },
  hooks: {
    afterChange: [() => revalidateGlobalPublicContent()],
  },
  fields: [
    {
      name: 'brandName',
      type: 'text',
      required: true,
      defaultValue: 'Community',
    },
    {
      name: 'siteDescription',
      type: 'textarea',
      label: 'Site description',
      defaultValue: 'A platform for community connection and shared knowledge.',
    },
    {
      name: 'defaultLocale',
      type: 'text',
      label: 'Default locale',
      defaultValue: 'en',
    },
    {
      name: 'lang',
      type: 'text',
      label: 'Language (HTML lang attribute)',
      defaultValue: 'en',
    },
    {
      name: 'instagramUrl',
      type: 'text',
      label: 'Instagram URL',
    },
    {
      name: 'whatsappUrl',
      type: 'text',
      label: 'WhatsApp URL',
    },
  ],
}
