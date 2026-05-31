import { describe, expect, it } from 'vitest'

import { formatRut, normalizeRut, validateRut } from '@/lib/rut'

describe('RUT utilities', () => {
  it('normalizes valid RUT input with dots, hyphen, whitespace, and lowercase k', () => {
    expect(normalizeRut(' 12.345.678-5 ')).toBe('12345678-5')
    expect(normalizeRut('1.000.005-k')).toBe('1000005-K')
  })

  it('formats normalized RUT parts for Chilean display', () => {
    expect(formatRut('12345678', '5')).toBe('12.345.678-5')
  })

  it('rejects malformed input without treating it as not found', () => {
    expect(validateRut('')).toEqual({ ok: false, reason: 'empty' })
    expect(validateRut('12.345.678-X')).toEqual({ ok: false, reason: 'invalid_format' })
    expect(validateRut('12.345.678-9')).toEqual({ ok: false, reason: 'invalid_check_digit' })
  })
})
