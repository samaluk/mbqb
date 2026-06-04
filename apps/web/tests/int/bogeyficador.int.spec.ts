import { getPayload, type Payload } from 'payload'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import { checkActiveMembership, findActiveMembershipByLookupHash } from '@/lib/bogeyficador'
import { getActiveMembershipPrivacyFields } from '@/lib/activeMembershipPrivacy'

let payload: Payload

const testRut = '12.345.678-5'
const getTestMembershipPrivacyFields = () => {
  const fields = getActiveMembershipPrivacyFields(
    testRut,
    process.env.PAYLOAD_SECRET ?? 'development-secret',
  )

  if (!fields) {
    throw new Error('Invalid test RUT')
  }

  return fields
}

describe('Bogeyficador membership integration', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  beforeEach(async () => {
    await payload.delete({
      collection: 'active-memberships',
      overrideAccess: true,
      where: {
        rut: {
          equals: testRut,
        },
      },
    })
  })

  it('finds active memberships through the hashed lookup field', async () => {
    await payload.create({
      collection: 'active-memberships',
      data: {
        ...getTestMembershipPrivacyFields(),
        isActive: true,
        rut: testRut,
      },
      draft: false,
      overrideAccess: true,
    })

    const result = await checkActiveMembership(testRut, {
      findByLookupHash: (lookupHash) => findActiveMembershipByLookupHash(payload, lookupHash),
      hashSecret: process.env.PAYLOAD_SECRET ?? 'development-secret',
    })

    expect(result).toEqual({ status: 'active' })
  })

  it('does not expose inactive memberships as active', async () => {
    await payload.create({
      collection: 'active-memberships',
      data: {
        ...getTestMembershipPrivacyFields(),
        isActive: false,
        rut: testRut,
      },
      draft: false,
      overrideAccess: true,
    })

    const result = await checkActiveMembership(testRut, {
      findByLookupHash: (lookupHash) => findActiveMembershipByLookupHash(payload, lookupHash),
      hashSecret: process.env.PAYLOAD_SECRET ?? 'development-secret',
    })

    expect(result).toEqual({ status: 'not_found' })
  })
})
