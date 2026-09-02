import { describe, expect, it } from 'vitest'

import { getMemberIdentifierConfig, MEMBER_IDENTIFIER_CONFIGS } from '@/lib/memberIdentifiers'

describe('memberIdentifiers configuration', () => {
  it('returns generic configuration by default and when requested', () => {
    const fallback = getMemberIdentifierConfig()
    const explicit = getMemberIdentifierConfig('generic')

    expect(fallback).toEqual(MEMBER_IDENTIFIER_CONFIGS.generic)
    expect(explicit).toEqual(MEMBER_IDENTIFIER_CONFIGS.generic)
    expect(explicit.type).toBe('generic')
    expect(explicit.label).toBe('Member identifier')
    expect(explicit.placeholder).toBe('e.g. MEMBER-1234')
    expect(explicit.formatInput).toBeUndefined()
  })

  it('preserves raw numeric IDs without forced RUT rewriting in generic mode', () => {
    const config = getMemberIdentifierConfig('generic')
    const numericId = '123456'

    const formatted = config.formatInput ? config.formatInput(numericId) : numericId
    expect(formatted).toBe('123456')
  })

  it('returns Chilean RUT configuration when requested', () => {
    const config = getMemberIdentifierConfig('cl_rut')

    expect(config.type).toBe('cl_rut')
    expect(config.label).toBe('RUT')
    expect(config.placeholder).toBe('12.345.678-5')
    expect(typeof config.formatInput).toBe('function')
    expect(config.formatInput?.('123456785')).toBe('12.345.678-5')
    expect(config.formatInput?.('1000005k')).toBe('1.000.005-K')
  })
})
