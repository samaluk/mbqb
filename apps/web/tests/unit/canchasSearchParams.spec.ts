import { describe, expect, it } from 'vitest'

import { clampNumber } from '@/lib/canchasBrowsing'

describe('clampNumber', () => {
  it('uses the fallback when pageSize is missing', () => {
    expect(clampNumber('', 1, 50, 10)).toBe(10)
  })

  it('clamps valid integers inside the range', () => {
    expect(clampNumber('20', 1, 50, 10)).toBe(20)
    expect(clampNumber('99', 1, 50, 10)).toBe(50)
  })

  it('uses the fallback for invalid values', () => {
    expect(clampNumber('abc', 1, 50, 10)).toBe(10)
    expect(clampNumber('10.5', 1, 50, 10)).toBe(10)
  })
})
