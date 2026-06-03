import { describe, expect, it } from 'vitest'

import {
  getCanchaLocationFromPoint,
  getCanchasNearWhere,
  isCanchaLocationPoint,
  toCanchaLocationPoint,
  toGeoCoordinates,
} from '../../src/lib/canchasLocation'

describe('canchasLocation', () => {
  it('validates Payload point tuples as [longitude, latitude]', () => {
    expect(isCanchaLocationPoint([-70.6, -33.4])).toBe(true)
    expect(isCanchaLocationPoint([-70.6])).toBe(false)
    expect(isCanchaLocationPoint([-200, -33.4])).toBe(false)
  })

  it('converts between point tuples and latitude/longitude objects', () => {
    const point: [number, number] = [-70.6693, -33.4489]

    expect(toGeoCoordinates(point)).toEqual({
      latitude: -33.4489,
      longitude: -70.6693,
    })
    expect(toCanchaLocationPoint({ latitude: -33.4489, longitude: -70.6693 })).toEqual(point)
    expect(getCanchaLocationFromPoint(point)).toEqual({
      latitude: -33.4489,
      longitude: -70.6693,
    })
  })

  it('builds Payload near queries in [longitude, latitude] order', () => {
    expect(
      getCanchasNearWhere({ latitude: -33.4489, longitude: -70.6693 }, 25),
    ).toEqual({
      location: {
        near: [-70.6693, -33.4489, 25_000],
      },
    })
  })
})
