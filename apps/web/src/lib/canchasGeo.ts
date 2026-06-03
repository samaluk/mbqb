import { getCanchaLocation, type CanchaMapItem } from '@/lib/canchas'
import type { GeoCoordinates } from '@/lib/canchasLocation'

const earthRadiusKm = 6371

export const defaultMaxDistanceKm = 50
export const minMaxDistanceKm = 5
export const maxMaxDistanceKm = 250

export type GeoPoint = GeoCoordinates

export type CanchaWithDistance = CanchaMapItem & {
  distanceKm: number
}

export function getDistanceKm(from: GeoPoint, to: GeoPoint): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180
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

export function annotateCanchasWithDistance(
  canchas: CanchaMapItem[],
  origin: GeoPoint,
): CanchaWithDistance[] {
  return canchas.flatMap((cancha) => {
    const location = getCanchaLocation(cancha)

    if (!location) return []

    return [
      {
        ...cancha,
        distanceKm: getDistanceKm(origin, location),
      },
    ]
  })
}

export function filterCanchasWithinRadius(canchas: CanchaWithDistance[], maxKm: number) {
  return canchas.filter((cancha) => cancha.distanceKm <= maxKm)
}

export function sortCanchasByDistance(canchas: CanchaWithDistance[]) {
  return [...canchas].sort((left, right) => left.distanceKm - right.distanceKm)
}

export function paginateCanchas<T>(canchas: T[], page: number, pageSize: number) {
  const totalDocs = canchas.length
  const totalPages = Math.max(1, Math.ceil(totalDocs / pageSize))
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const start = (safePage - 1) * pageSize

  return {
    docs: canchas.slice(start, start + pageSize),
    page: safePage,
    totalDocs,
    totalPages,
  }
}
