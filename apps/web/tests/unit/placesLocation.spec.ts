import { describe, expect, it } from 'vitest'

import {
  getPlaceLocationFromPoint,
  getPlacesNearWhere,
  isPlaceLocationPoint,
  toPlaceLocationPoint,
  toGeoCoordinates,
} from '../../src/lib/placesLocation'

describe('placesLocation', () => {
  it('validates Payload point tuples as [longitude, latitude]', () => {
    expect(isPlaceLocationPoint([-70.6, -33.4])).toBe(true)
    expect(isPlaceLocationPoint([-70.6])).toBe(false)
    expect(isPlaceLocationPoint([-200, -33.4])).toBe(false)
  })

  it('converts between point tuples and latitude/longitude objects', () => {
    const point: [number, number] = [-70.6693, -33.4489]

    expect(toGeoCoordinates(point)).toEqual({
      latitude: -33.4489,
      longitude: -70.6693,
    })
    expect(toPlaceLocationPoint({ latitude: -33.4489, longitude: -70.6693 })).toEqual(point)
    expect(getPlaceLocationFromPoint(point)).toEqual({
      latitude: -33.4489,
      longitude: -70.6693,
    })
  })

  it('builds Payload near queries in [longitude, latitude] order', () => {
    expect(getPlacesNearWhere({ latitude: -33.4489, longitude: -70.6693 }, 25)).toEqual({
      location: {
        near: [-70.6693, -33.4489, 25_000],
      },
    })
  })
})
