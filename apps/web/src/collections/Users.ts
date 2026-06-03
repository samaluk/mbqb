import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminField, ownerOrAdmin } from '@/access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    read: ownerOrAdmin,
    create: isAdmin,
    update: ownerOrAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'admin',
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Editor',
          value: 'editor',
        },
        {
          label: 'Validation Manager',
          value: 'validation-manager',
        },
      ],
      access: {
        create: isAdminField,
        update: isAdminField,
      },
    },
  ],
}
