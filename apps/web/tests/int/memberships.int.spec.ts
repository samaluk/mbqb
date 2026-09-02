import { getPayload, type Payload } from 'payload'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { env } from '@/env'
import config from '@/payload.config'
import { checkMembership, findMembershipByLookupHash } from '@/lib/memberships'

let payload: Payload

const testIdentifier = 'MEMBER-42'

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
    const created = await payload.create({
      collection: 'memberships',
      data: {
        identifier: testIdentifier,
        isActive: true,
        lookupHash: '',
        normalizedIdentifier: '',
      },
      draft: false,
      overrideAccess: true,
    })

    expect(created.normalizedIdentifier).toBe('member-42')
    expect(created.lookupHash).toMatch(/^[a-f0-9]{64}$/)

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
        identifier: testIdentifier,
        isActive: false,
        lookupHash: '',
        normalizedIdentifier: '',
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
