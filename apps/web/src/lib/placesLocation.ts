import type { Place } from '@/payload-types'

/** Payload point fields are `[longitude, latitude]`. */
export type PlaceLocationPoint = [number, number]

export type GeoCoordinates = {
  latitude: number
  longitude: number
}

export function isPlaceLocationPoint(value: unknown): value is PlaceLocationPoint {
  if (!Array.isArray(value) || value.length !== 2) return false

  // oxlint-disable-next-line typescript/no-unsafe-assignment
  const [longitude, latitude] = value

  return (
    typeof longitude === 'number' &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180 &&
    typeof latitude === 'number' &&
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90
  )
}

export function toGeoCoordinates(point: PlaceLocationPoint): GeoCoordinates {
  const [longitude, latitude] = point

  return { latitude, longitude }
}

export function toPlaceLocationPoint({ latitude, longitude }: GeoCoordinates): PlaceLocationPoint {
  return [longitude, latitude]
}

export function getPlaceLocationFromPoint(location: Place['location']): GeoCoordinates | undefined {
  if (!isPlaceLocationPoint(location)) return undefined

  return toGeoCoordinates(location)
}

const metersPerKm = 1000

export function getPlacesNearWhere(origin: GeoCoordinates, maxKm: number) {
  const [longitude, latitude] = toPlaceLocationPoint(origin)

  // Payload point `near` is [longitude, latitude, maxDistanceMeters, minDistanceMeters?]
  // — not a sibling `maxDistance` key (rejected as location.maxDistance).
  return {
    location: {
      near: [longitude, latitude, maxKm * metersPerKm],
    },
  } as const
}
