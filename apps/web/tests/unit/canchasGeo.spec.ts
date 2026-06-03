import { describe, expect, it } from 'vitest'

import {
  annotateCanchasWithDistance,
  filterCanchasWithinRadius,
  formatDistanceKm,
  getDistanceKm,
  sortCanchasByDistance,
} from '../../src/lib/canchasGeo'
import type { CanchaMapItem } from '../../src/lib/canchas'

const santiagoOrigin = { latitude: -33.4489, longitude: -70.6693 }

const sampleCancha = (overrides: Partial<CanchaMapItem> = {}): CanchaMapItem => ({
  accessType: 'pay-and-play',
  id: 1,
  location: [-70.6, -33.4],
  slug: 'sample',
  title: 'Sample',
  ...overrides,
})

describe('getDistanceKm', () => {
  it('returns zero for the same point', () => {
    expect(getDistanceKm(santiagoOrigin, santiagoOrigin)).toBe(0)
  })

  it('returns a positive distance between two nearby points', () => {
    const distance = getDistanceKm(santiagoOrigin, { latitude: -33.5, longitude: -70.7 })

    expect(distance).toBeGreaterThan(5)
    expect(distance).toBeLessThan(20)
  })
})

describe('formatDistanceKm', () => {
  it('formats sub-kilometer distances in meters', () => {
    expect(formatDistanceKm(0.42)).toBe('420 m')
  })

  it('formats longer distances in kilometers', () => {
    expect(formatDistanceKm(12.4)).toBe('12 km')
  })
})

describe('geo filtering helpers', () => {
  it('annotates, filters, and sorts canchas by distance', () => {
    const canchas = [
      sampleCancha({ id: 1, location: [-70.6, -33.4] }),
      sampleCancha({ id: 2, location: [-70.75, -33.5] }),
      sampleCancha({ id: 3, location: [-71.1, -34.2] }),
      sampleCancha({ id: 4, title: 'Sin coordenadas', location: null }),
    ]

    const annotated = annotateCanchasWithDistance(canchas, santiagoOrigin)
    const filtered = filterCanchasWithinRadius(annotated, 30)
    const sorted = sortCanchasByDistance(filtered)

    expect(annotated).toHaveLength(3)
    expect(filtered).toHaveLength(2)
    expect(filtered.every((cancha) => cancha.distanceKm <= 30)).toBe(true)
    expect(sorted[0]?.distanceKm).toBeLessThanOrEqual(sorted[1]?.distanceKm ?? 0)
  })
})
