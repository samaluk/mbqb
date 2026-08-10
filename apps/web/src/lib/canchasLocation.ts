import type { Cancha } from '@/payload-types'

/** Payload point fields are `[longitude, latitude]`. */
export type CanchaLocationPoint = [number, number]

export type GeoCoordinates = {
  latitude: number
  longitude: number
}

export function isCanchaLocationPoint(value: unknown): value is CanchaLocationPoint {
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

export function toGeoCoordinates(point: CanchaLocationPoint): GeoCoordinates {
  const [longitude, latitude] = point

  return { latitude, longitude }
}

export function toCanchaLocationPoint({
  latitude,
  longitude,
}: GeoCoordinates): CanchaLocationPoint {
  return [longitude, latitude]
}

export function getCanchaLocationFromPoint(
  location: Cancha['location'],
): GeoCoordinates | undefined {
  if (!isCanchaLocationPoint(location)) return undefined

  return toGeoCoordinates(location)
}

const metersPerKm = 1000

export function getCanchasNearWhere(origin: GeoCoordinates, maxKm: number) {
  const [longitude, latitude] = toCanchaLocationPoint(origin)

  // Payload point `near` is [longitude, latitude, maxDistanceMeters, minDistanceMeters?]
  // — not a sibling `maxDistance` key (rejected as location.maxDistance).
  return {
    location: {
      near: [longitude, latitude, maxKm * metersPerKm],
    },
  } as const
}
