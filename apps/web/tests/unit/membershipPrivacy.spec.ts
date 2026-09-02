import { describe, expect, it } from 'vitest'

import {
  createLookupHash,
  getMembershipLookup,
  getMembershipPrivacyFields,
  normalizeIdentifier,
} from '@/lib/membershipPrivacy'

const HASH_PATTERN = /^[a-f0-9]{64}$/

describe('Membership privacy and normalization', () => {
  it('normalizes member identifiers with whitespace and mixed casing', () => {
    expect(normalizeIdentifier('  MEMBER-12345  ')).toBe('member-12345')
    expect(normalizeIdentifier('user@EXAMPLE.com')).toBe('user@example.com')
  })

  it('normalizes Chilean RUTs to unpunctuated lowercase without dots or dash', () => {
    expect(normalizeIdentifier(' 12.345.678-5 ')).toBe('123456785')
    expect(normalizeIdentifier('12345678-5')).toBe('123456785')
    expect(normalizeIdentifier('123456785')).toBe('123456785')
    expect(normalizeIdentifier('1.000.005-k')).toBe('1000005k')
    expect(normalizeIdentifier('1.000.005-K')).toBe('1000005k')
    expect(normalizeIdentifier('1000005k')).toBe('1000005k')
  })

  it('matches lookup hashes between dotted and unpunctuated RUT inputs', () => {
    const dottedLookup = getMembershipLookup('12.345.678-5', 'test-secret')
    const plainLookup = getMembershipLookup('12345678-5', 'test-secret')
    const rawLookup = getMembershipLookup('123456785', 'test-secret')

    if (!dottedLookup.ok || !plainLookup.ok || !rawLookup.ok) {
      throw new Error('Expected valid RUTs to produce lookup hashes')
    }

    expect(dottedLookup.lookupHash).toBe(plainLookup.lookupHash)
    expect(dottedLookup.lookupHash).toBe(rawLookup.lookupHash)
  })

  it('rejects empty or whitespace-only identifiers', () => {
    expect(normalizeIdentifier('')).toBeNull()
    expect(normalizeIdentifier('   ')).toBeNull()
    expect(getMembershipPrivacyFields('', 'test-secret')).toBeNull()
    expect(getMembershipPrivacyFields('   ', 'test-secret')).toBeNull()
  })

  it('projects staff-entered identifiers into normalized and lookup-safe fields', () => {
    const fields = getMembershipPrivacyFields('  MEMBER-99  ', 'test-secret')

    expect(fields?.normalizedIdentifier).toBe('member-99')
    expect(fields?.lookupHash).toMatch(HASH_PATTERN)
    expect(fields?.lookupHash).not.toContain('member-99')
  })

  it('returns only the lookup hash for public membership checks', () => {
    const lookup = getMembershipLookup('MEMBER-99', 'test-secret')

    if (!lookup.ok) throw new Error('Expected a valid identifier to produce a lookup hash')
    expect(lookup.lookupHash).toMatch(HASH_PATTERN)
  })

  it('keeps staff and public projections on the same lookup hash', () => {
    const fields = getMembershipPrivacyFields('  MEMBER-99  ', 'test-secret')
    const lookup = getMembershipLookup('member-99', 'test-secret')

    if (!lookup.ok) throw new Error('Expected a valid identifier to produce a lookup hash')
    expect(lookup.lookupHash).toBe(fields?.lookupHash)
  })

  it('uses HMAC-SHA256 keyed with the secret', () => {
    const hash1 = createLookupHash('member-1', 'secret-a')
    const hash2 = createLookupHash('member-1', 'secret-b')

    expect(hash1).toMatch(HASH_PATTERN)
    expect(hash2).toMatch(HASH_PATTERN)
    expect(hash1).not.toBe(hash2)
  })
})
