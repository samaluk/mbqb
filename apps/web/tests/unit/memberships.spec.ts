import { describe, expect, it } from 'vitest'

import { checkMembership } from '@/lib/memberships'

describe('Membership lookup and verification', () => {
  it('rejects invalid or empty identifiers before looking up membership records', async () => {
    const result = await checkMembership('   ', {
      findByLookupHash: async () => {
        throw new Error('lookup should not run for invalid identifiers')
      },
      hashSecret: 'test-secret',
    })

    expect(result).toEqual({ status: 'invalid_identifier' })
  })

  it('returns active for an active membership without exposing member details', async () => {
    const result = await checkMembership('MEMBER-123', {
      findByLookupHash: async () => ({
        id: 1,
        identifier: 'MEMBER-123',
        isActive: true,
        lookupHash: 'hash',
        normalizedIdentifier: 'member-123',
        notes: 'internal note',
      }),
      hashSecret: 'test-secret',
    })

    expect(result).toEqual({ status: 'active' })
  })

  it('returns not found for inactive or missing memberships', async () => {
    const inactive = await checkMembership('MEMBER-123', {
      findByLookupHash: async () => ({
        id: 1,
        identifier: 'MEMBER-123',
        isActive: false,
        lookupHash: 'hash',
        normalizedIdentifier: 'member-123',
      }),
      hashSecret: 'test-secret',
    })

    const missing = await checkMembership('MEMBER-123', {
      findByLookupHash: async () => null,
      hashSecret: 'test-secret',
    })

    expect(inactive).toEqual({ status: 'not_found' })
    expect(missing).toEqual({ status: 'not_found' })
  })

  it('looks up memberships by HMAC hash instead of raw identifier', async () => {
    let lookupHash = ''

    await checkMembership('MEMBER-123', {
      findByLookupHash: async (hash) => {
        lookupHash = hash
        return null
      },
      hashSecret: 'test-secret',
    })

    expect(lookupHash).toMatch(/^[a-f0-9]{64}$/)
    expect(lookupHash).not.toContain('MEMBER-123')
    expect(lookupHash).not.toContain('member-123')
  })
})
