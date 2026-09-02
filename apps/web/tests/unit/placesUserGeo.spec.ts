import { describe, expect, it } from 'vitest'

import { createStoredUserGeo, parseStoredUserGeo } from '../../src/lib/placesUserGeo'

describe('placesUserGeo', () => {
  it('creates valid stored geo objects', () => {
    expect(createStoredUserGeo(-33.45, -70.66, 40)).toEqual({
      latitude: -33.45,
      longitude: -70.66,
      maxKm: 40,
    })
  })

  it('rejects invalid stored geo payloads', () => {
    expect(parseStoredUserGeo({ latitude: 120, longitude: 0, maxKm: 40 })).toBeNull()
    expect(parseStoredUserGeo({ latitude: -33, longitude: -70, maxKm: 2 })).toBeNull()
  })
})
