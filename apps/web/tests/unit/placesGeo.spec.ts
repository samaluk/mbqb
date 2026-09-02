import { describe, expect, it } from 'vitest'

import {
  annotatePlacesWithDistance,
  filterPlacesWithinRadius,
  formatDistanceKm,
  getDistanceKm,
  sortPlacesByDistance,
} from '../../src/lib/placesGeo'
import type { PlaceMapItem } from '../../src/lib/places'

const santiagoOrigin = { latitude: -33.4489, longitude: -70.6693 }

const samplePlace = (overrides: Partial<PlaceMapItem> = {}): PlaceMapItem => ({
  accessType: 'open',
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
  it('annotates, filters, and sorts places by distance', () => {
    const places = [
      samplePlace({ id: 1, location: [-70.6, -33.4] }),
      samplePlace({ id: 2, location: [-70.75, -33.5] }),
      samplePlace({ id: 3, location: [-71.1, -34.2] }),
      samplePlace({ id: 4, location: null, title: 'Sin coordenadas' }),
    ]

    const annotated = annotatePlacesWithDistance(places, santiagoOrigin)
    const filtered = filterPlacesWithinRadius(annotated, 30)
    const sorted = sortPlacesByDistance(filtered)

    expect(annotated).toHaveLength(3)
    expect(filtered).toHaveLength(2)
    expect(filtered.every((place) => place.distanceKm <= 30)).toBe(true)
    expect(sorted[0]?.distanceKm).toBeLessThanOrEqual(sorted[1]?.distanceKm ?? 0)
  })
})
