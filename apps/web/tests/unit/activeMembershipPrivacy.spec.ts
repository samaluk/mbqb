import { describe, expect, it } from 'vitest'

import {
  getActiveMembershipLookup,
  getActiveMembershipPrivacyFields,
} from '@/lib/activeMembershipPrivacy'

describe('Active MBQB Membership privacy', () => {
  it('projects staff-entered RUTs into normalized and lookup-safe fields', () => {
    const fields = getActiveMembershipPrivacyFields('12.345.678-5', 'test-secret')

    expect(fields).toEqual({
      normalizedRut: '12345678-5',
      rutLookupHash: expect.stringMatching(/^[a-f0-9]{64}$/),
    })
    expect(fields?.rutLookupHash).not.toContain('12345678')
  })

  it('rejects invalid RUTs before creating privacy fields', () => {
    expect(getActiveMembershipPrivacyFields('12.345.678-9', 'test-secret')).toBeNull()
  })

  it('returns only the lookup hash for public membership checks', () => {
    expect(getActiveMembershipLookup('12.345.678-5', 'test-secret')).toEqual({
      lookupHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      ok: true,
    })
  })

  it('keeps staff and public projections on the same lookup hash', () => {
    const fields = getActiveMembershipPrivacyFields('12.345.678-5', 'test-secret')
    const lookup = getActiveMembershipLookup('12.345.678-5', 'test-secret')

    expect(lookup).toEqual({
      lookupHash: fields?.rutLookupHash,
      ok: true,
    })
  })
})
