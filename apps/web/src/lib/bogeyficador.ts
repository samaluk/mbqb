import type { Payload } from 'payload'

import type { ActiveMembership } from '@/payload-types'

import { getActiveMembershipLookup } from '@/lib/activeMembershipPrivacy'

type MembershipRecord = Pick<
  ActiveMembership,
  'id' | 'isActive' | 'normalizedRut' | 'rut' | 'rutLookupHash' | 'notes'
>

export type BogeyficadorStatus = 'active' | 'invalid_rut' | 'not_found'

export type BogeyficadorResult = {
  status: BogeyficadorStatus
}

export type MembershipLookup = {
  findByLookupHash: (lookupHash: string) => Promise<MembershipRecord | null>
  hashSecret: string
}

export const checkActiveMembership = async (
  rutInput: string,
  lookup: MembershipLookup,
): Promise<BogeyficadorResult> => {
  const activeMembershipLookup = getActiveMembershipLookup(rutInput, lookup.hashSecret)

  if (!activeMembershipLookup.ok) {
    return { status: 'invalid_rut' }
  }

  const membership = await lookup.findByLookupHash(activeMembershipLookup.lookupHash)

  if (!membership?.isActive) {
    return { status: 'not_found' }
  }

  return { status: 'active' }
}

export const findActiveMembershipByLookupHash = async (
  payload: Payload,
  lookupHash: string,
): Promise<MembershipRecord | null> => {
  const result = await payload.find({
    collection: 'active-memberships',
    depth: 0,
    limit: 1,
    pagination: false,
    where: {
      rutLookupHash: {
        equals: lookupHash,
      },
    },
  })

  return result.docs[0] ?? null
}
