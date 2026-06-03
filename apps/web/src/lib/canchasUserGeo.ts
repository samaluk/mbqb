import {
  defaultMaxDistanceKm,
  maxMaxDistanceKm,
  minMaxDistanceKm,
  type GeoPoint,
} from '@/lib/canchasGeo'

export type StoredUserGeo = GeoPoint & {
  maxKm: number
}

export function parseStoredUserGeo(value: unknown): StoredUserGeo | null {
  if (!value || typeof value !== 'object') return null

  const record = value as Record<string, unknown>
  const latitude = Number(record.latitude)
  const longitude = Number(record.longitude)
  const maxKm = Number(record.maxKm)

  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180 ||
    !Number.isInteger(maxKm) ||
    maxKm < minMaxDistanceKm ||
    maxKm > maxMaxDistanceKm
  ) {
    return null
  }

  return { latitude, longitude, maxKm }
}

export function createStoredUserGeo(
  latitude: number,
  longitude: number,
  maxKm = defaultMaxDistanceKm,
) {
  return parseStoredUserGeo({ latitude, longitude, maxKm })
}
