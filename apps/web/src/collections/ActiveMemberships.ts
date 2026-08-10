import type { CollectionConfig } from 'payload'

import { isAdmin, isValidationManagerOrAdmin } from '@/access/roles'
import { env } from '@/env'
import { getActiveMembershipPrivacyFields } from '@/lib/activeMembershipPrivacy'

export const ActiveMemberships: CollectionConfig = {
  slug: 'active-memberships',
  labels: {
    singular: 'Active MBQB Membership',
    plural: 'Active MBQB Memberships',
  },
  admin: {
    useAsTitle: 'normalizedRut',
    defaultColumns: ['normalizedRut', 'isActive', 'updatedAt'],
  },
  access: {
    read: isValidationManagerOrAdmin,
    create: isValidationManagerOrAdmin,
    update: isValidationManagerOrAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data?.rut) return data

        // oxlint-disable-next-line typescript/no-unsafe-argument
        const privacyFields = getActiveMembershipPrivacyFields(data.rut, env.PAYLOAD_SECRET)

        if (!privacyFields) {
          return data
        }

        return {
          ...data,
          ...privacyFields,
        }
      },
    ],
  },
  fields: [
    {
      name: 'rut',
      type: 'text',
      label: 'RUT',
      required: true,
      admin: {
        description:
          'Staff entry field. Payload stores a normalized RUT and lookup hash for checks.',
      },
    },
    {
      name: 'normalizedRut',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'rutLookupHash',
      type: 'text',
      required: true,
      unique: true,
      access: {
        read: () => false,
      },
      admin: {
        hidden: true,
        readOnly: true,
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      required: true,
      defaultValue: true,
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal staff notes. Never exposed in the public Bogeyficador result.',
      },
    },
  ],
  versions: {
    drafts: false,
  },
}
