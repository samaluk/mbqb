import { describe, expect, it } from 'vitest'

import {
  cleanRut,
  formatIdentifierInput,
  formatRut,
  formatRutInput,
  isRutCandidate,
  normalizeRut,
  validateRut,
} from '@/lib/rut'

describe('RUT utilities', () => {
  it('normalizes valid RUT input with dots, hyphen, whitespace, and lowercase k', () => {
    expect(normalizeRut(' 12.345.678-5 ')).toBe('12345678-5')
    expect(normalizeRut('1.000.005-k')).toBe('1000005-K')
  })

  it('formats normalized RUT parts for Chilean display', () => {
    expect(formatRut('12345678', '5')).toBe('12.345.678-5')
  })

  it('cleans punctuation and spacing from RUT input', () => {
    expect(cleanRut('12.345.678-5')).toBe('123456785')
    expect(cleanRut(' 1.000.005-k ')).toBe('1000005K')
  })

  it('autoformats RUT input while typing keystrokes', () => {
    expect(formatRutInput('1')).toBe('1')
    expect(formatRutInput('12')).toBe('1-2')
    expect(formatRutInput('123')).toBe('12-3')
    expect(formatRutInput('1234')).toBe('123-4')
    expect(formatRutInput('12345')).toBe('1.234-5')
    expect(formatRutInput('123456')).toBe('12.345-6')
    expect(formatRutInput('1234567')).toBe('123.456-7')
    expect(formatRutInput('12345678')).toBe('1.234.567-8')
    expect(formatRutInput('123456785')).toBe('12.345.678-5')
    expect(formatRutInput('1000005k')).toBe('1.000.005-K')
  })

  it('detects RUT candidates and leaves generic identifiers untouched', () => {
    expect(isRutCandidate('123456785')).toBe(true)
    expect(isRutCandidate('12.345.678-5')).toBe(true)
    expect(isRutCandidate('1000005k')).toBe(true)
    expect(isRutCandidate('MEMBER-1234')).toBe(false)
    expect(isRutCandidate('user@example.com')).toBe(false)
    expect(isRutCandidate('12k34')).toBe(false)

    expect(formatIdentifierInput('123456785')).toBe('12.345.678-5')
    expect(formatIdentifierInput('1000005k')).toBe('1.000.005-K')
    expect(formatIdentifierInput('MEMBER-1234')).toBe('MEMBER-1234')
    expect(formatIdentifierInput('user@example.com')).toBe('user@example.com')
  })

  it('rejects malformed input without treating it as not found', () => {
    expect(validateRut('')).toEqual({ ok: false, reason: 'empty' })
    expect(validateRut('12.345.678-X')).toEqual({ ok: false, reason: 'invalid_format' })
    expect(validateRut('12.345.678-9')).toEqual({ ok: false, reason: 'invalid_check_digit' })
  })
})
