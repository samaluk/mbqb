import {
  defaultMaxDistanceKm,
  maxMaxDistanceKm,
  minMaxDistanceKm,
  type GeoPoint,
} from '@/lib/canchasGeo'

const storageKey = 'mbqb.canchas.userGeo'
export const canchasGeoChangedEvent = 'mbqb:canchas-geo-changed'

export type StoredUserGeo = GeoPoint & {
  maxKm: number
}

export function readStoredUserGeo(): StoredUserGeo | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.sessionStorage.getItem(storageKey)

    if (!raw) return null

    return parseStoredUserGeo(JSON.parse(raw))
  } catch {
    return null
  }
}

export function writeStoredUserGeo(geo: StoredUserGeo | null) {
  if (typeof window === 'undefined') return

  if (geo) {
    window.sessionStorage.setItem(storageKey, JSON.stringify(geo))
  } else {
    window.sessionStorage.removeItem(storageKey)
  }

  window.dispatchEvent(new Event(canchasGeoChangedEvent))
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

export function createStoredUserGeo(latitude: number, longitude: number, maxKm = defaultMaxDistanceKm) {
  return parseStoredUserGeo({ latitude, longitude, maxKm })
}
