import { getPayload, type Payload } from 'payload'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { env } from '@/env'
import config from '@/payload.config'
import { checkMembership, findMembershipByLookupHash } from '@/lib/memberships'
import { getMembershipPrivacyFields } from '@/lib/membershipPrivacy'

let payload: Payload

const testIdentifier = 'MEMBER-42'
const getTestMembershipPrivacyFields = () => {
  const fields = getMembershipPrivacyFields(testIdentifier, env.PAYLOAD_SECRET)

  if (!fields) {
    throw new Error('Invalid test identifier')
  }

  return fields
}

describe('Memberships integration', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  beforeEach(async () => {
    await payload.delete({
      collection: 'memberships',
      overrideAccess: true,
      where: {
        identifier: {
          equals: testIdentifier,
        },
      },
    })
  })

  it('finds active memberships through the hashed lookup field', async () => {
    await payload.create({
      collection: 'memberships',
      data: {
        ...getTestMembershipPrivacyFields(),
        identifier: testIdentifier,
        isActive: true,
      },
      draft: false,
      overrideAccess: true,
    })

    const result = await checkMembership(testIdentifier, {
      findByLookupHash: (lookupHash) => findMembershipByLookupHash(payload, lookupHash),
      hashSecret: env.PAYLOAD_SECRET,
    })

    expect(result).toEqual({ status: 'active' })
  })

  it('does not expose inactive memberships as active', async () => {
    await payload.create({
      collection: 'memberships',
      data: {
        ...getTestMembershipPrivacyFields(),
        identifier: testIdentifier,
        isActive: false,
      },
      draft: false,
      overrideAccess: true,
    })

    const result = await checkMembership(testIdentifier, {
      findByLookupHash: (lookupHash) => findMembershipByLookupHash(payload, lookupHash),
      hashSecret: env.PAYLOAD_SECRET,
    })

    expect(result).toEqual({ status: 'not_found' })
  })
})
