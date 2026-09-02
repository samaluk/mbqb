import { getPayload, type Payload } from 'payload'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { env } from '@/env'
import config from '@/payload.config'
import { checkMembership, findMembershipByLookupHash } from '@/lib/memberships'

let payload: Payload

const testIdentifier = 'MEMBER-42'
const testRut = '12.345.678-5'
const cleanedRut = '123456785'

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
        or: [
          {
            identifier: {
              equals: testIdentifier,
            },
          },
          {
            identifier: {
              equals: cleanedRut,
            },
          },
        ],
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

  it('stores RUTs without dots or dash and verifies them across input formats', async () => {
    const created = await payload.create({
      collection: 'memberships',
      data: {
        identifier: testRut,
        isActive: true,
        lookupHash: '',
        normalizedIdentifier: '',
      },
      draft: false,
      overrideAccess: true,
    })

    expect(created.identifier).toBe(cleanedRut)
    expect(created.normalizedIdentifier).toBe(cleanedRut)
    expect(created.lookupHash).toMatch(/^[a-f0-9]{64}$/)

    // Can be verified using formatted RUT, hyphen-only RUT, or raw digits
    for (const input of [testRut, '12345678-5', cleanedRut]) {
      const result = await checkMembership(input, {
        findByLookupHash: (lookupHash) => findMembershipByLookupHash(payload, lookupHash),
        hashSecret: env.PAYLOAD_SECRET,
      })

      expect(result).toEqual({ status: 'active' })
    }
  })
})
