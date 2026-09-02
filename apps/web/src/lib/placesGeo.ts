import { getPlaceLocation, type PlaceMapItem } from '@/lib/places'
import type { GeoCoordinates } from '@/lib/placesLocation'

const earthRadiusKm = 6371

export const defaultMaxDistanceKm = 50
export const minMaxDistanceKm = 5
export const maxMaxDistanceKm = 250

export type GeoPoint = GeoCoordinates

export type PlaceWithDistance = PlaceMapItem & {
  distanceKm: number
}

const toRadians = (degrees: number) => (degrees * Math.PI) / 180

export function getDistanceKm(from: GeoPoint, to: GeoPoint): number {
  const deltaLatitude = toRadians(to.latitude - from.latitude)
  const deltaLongitude = toRadians(to.longitude - from.longitude)
  const fromLatitude = toRadians(from.latitude)
  const toLatitude = toRadians(to.latitude)

  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(deltaLongitude / 2) ** 2

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
}

export function formatDistanceKm(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`
  }

  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km`
  }

  return `${Math.round(distanceKm)} km`
}

export function annotatePlacesWithDistance(
  places: PlaceMapItem[],
  origin: GeoPoint,
): PlaceWithDistance[] {
  return places.flatMap((place) => {
    const location = getPlaceLocation(place)

    if (!location) return []

    return [
      {
        ...place,
        distanceKm: getDistanceKm(origin, location),
      },
    ]
  })
}

export function filterPlacesWithinRadius(places: PlaceWithDistance[], maxKm: number) {
  return places.filter((place) => place.distanceKm <= maxKm)
}

export function sortPlacesByDistance(places: PlaceWithDistance[]) {
  return places.toSorted((left, right) => left.distanceKm - right.distanceKm)
}

export function paginatePlaces<T>(places: T[], page: number, pageSize: number) {
  const totalDocs = places.length
  const totalPages = Math.max(1, Math.ceil(totalDocs / pageSize))
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const start = (safePage - 1) * pageSize

  return {
    docs: places.slice(start, start + pageSize),
    page: safePage,
    totalDocs,
    totalPages,
  }
}
