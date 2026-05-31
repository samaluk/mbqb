import { describe, expect, it } from 'vitest'

import { checkActiveMembership } from '@/lib/bogeyficador'

describe('Bogeyficador membership lookup', () => {
  it('rejects invalid RUTs before looking up membership records', async () => {
    const result = await checkActiveMembership('12.345.678-9', {
      findByLookupHash: async () => {
        throw new Error('lookup should not run for invalid RUTs')
      },
      hashSecret: 'test-secret',
    })

    expect(result).toEqual({ status: 'invalid_rut' })
  })

  it('returns active for an active membership without exposing member details', async () => {
    const result = await checkActiveMembership('12.345.678-5', {
      findByLookupHash: async () => ({
        id: 1,
        isActive: true,
        normalizedRut: '12345678-5',
        notes: 'internal note',
        rut: '12.345.678-5',
        rutLookupHash: 'hash',
      }),
      hashSecret: 'test-secret',
    })

    expect(result).toEqual({ status: 'active' })
  })

  it('returns not found for inactive or missing memberships', async () => {
    const inactive = await checkActiveMembership('12.345.678-5', {
      findByLookupHash: async () => ({
        id: 1,
        isActive: false,
        normalizedRut: '12345678-5',
        rut: '12.345.678-5',
        rutLookupHash: 'hash',
      }),
      hashSecret: 'test-secret',
    })

    const missing = await checkActiveMembership('12.345.678-5', {
      findByLookupHash: async () => null,
      hashSecret: 'test-secret',
    })

    expect(inactive).toEqual({ status: 'not_found' })
    expect(missing).toEqual({ status: 'not_found' })
  })

  it('looks up memberships by hash instead of raw RUT', async () => {
    let lookupHash = ''

    await checkActiveMembership('12.345.678-5', {
      findByLookupHash: async (hash) => {
        lookupHash = hash
        return null
      },
      hashSecret: 'test-secret',
    })

    expect(lookupHash).toMatch(/^[a-f0-9]{64}$/)
    expect(lookupHash).not.toContain('12345678')
  })
})
