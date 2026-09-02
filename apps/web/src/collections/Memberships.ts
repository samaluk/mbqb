import type { CollectionConfig } from 'payload'

import { isAdmin, isValidationManagerOrAdmin } from '@/access/roles'
import { env } from '@/env'
import { getMembershipPrivacyFields } from '@/lib/membershipPrivacy'
import { validateRut } from '@/lib/rut'

export const Memberships: CollectionConfig = {
  slug: 'memberships',
  labels: {
    singular: 'Membership',
    plural: 'Memberships',
  },
  admin: {
    useAsTitle: 'normalizedIdentifier',
    defaultColumns: ['normalizedIdentifier', 'isActive', 'updatedAt'],
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
        if (!data?.identifier || typeof data.identifier !== 'string') return data

        const rutResult = validateRut(data.identifier)
        const identifier = rutResult.ok
          ? `${rutResult.rut.body}${rutResult.rut.checkDigit}`
          : data.identifier

        const privacyFields = getMembershipPrivacyFields(identifier, env.PAYLOAD_SECRET)

        if (!privacyFields) {
          return data
        }

        return {
          ...data,
          identifier,
          ...privacyFields,
        }
      },
    ],
  },
  fields: [
    {
      name: 'identifier',
      type: 'text',
      label: 'Member Identifier',
      required: true,
      admin: {
        description:
          'Staff entry field. Payload stores a normalized identifier and lookup hash for checks.',
      },
    },
    {
      name: 'normalizedIdentifier',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'lookupHash',
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
        description: 'Internal staff notes. Never exposed in the public verification result.',
      },
    },
  ],
  versions: {
    drafts: false,
  },
}
