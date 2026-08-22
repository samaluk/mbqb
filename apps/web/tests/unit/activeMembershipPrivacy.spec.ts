import { describe, expect, it } from 'vitest'

import {
  getActiveMembershipLookup,
  getActiveMembershipPrivacyFields,
} from '@/lib/activeMembershipPrivacy'

const RUT_HASH_PATTERN = /^[a-f0-9]{64}$/

describe('Active MBQB Membership privacy', () => {
  it('projects staff-entered RUTs into normalized and lookup-safe fields', () => {
    const fields = getActiveMembershipPrivacyFields('12.345.678-5', 'test-secret')

    expect(fields?.normalizedRut).toBe('12345678-5')
    // Asserted per-field: vitest's expect.stringMatching() matchers are
    // typed `any`, which leaks unsafe assignments into object literals.
    expect(fields?.rutLookupHash).toMatch(RUT_HASH_PATTERN)
    expect(fields?.rutLookupHash).not.toContain('12345678')
  })

  it('rejects invalid RUTs before creating privacy fields', () => {
    expect(getActiveMembershipPrivacyFields('12.345.678-9', 'test-secret')).toBeNull()
  })

  it('returns only the lookup hash for public membership checks', () => {
    const lookup = getActiveMembershipLookup('12.345.678-5', 'test-secret')

    if (!lookup.ok) throw new Error('Expected a valid RUT to produce a lookup hash')
    expect(lookup.lookupHash).toMatch(RUT_HASH_PATTERN)
  })

  it('keeps staff and public projections on the same lookup hash', () => {
    const fields = getActiveMembershipPrivacyFields('12.345.678-5', 'test-secret')
    const lookup = getActiveMembershipLookup('12.345.678-5', 'test-secret')

    if (!lookup.ok) throw new Error('Expected a valid RUT to produce a lookup hash')
    expect(lookup.lookupHash).toBe(fields?.rutLookupHash)
  })
})
