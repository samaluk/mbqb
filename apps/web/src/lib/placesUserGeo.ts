import {
  defaultMaxDistanceKm,
  maxMaxDistanceKm,
  minMaxDistanceKm,
  type GeoPoint,
} from '@/lib/placesGeo'

export type StoredUserGeo = GeoPoint & {
  maxKm: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function parseStoredUserGeo(value: unknown): StoredUserGeo | null {
  if (!isRecord(value)) return null

  const record = value
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
