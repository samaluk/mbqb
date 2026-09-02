export const placeAccessLabels = {
  private: 'Privado',
  open: 'Abierto',
  restricted: 'Restringido',
} as const

export type PlaceAccessType = keyof typeof placeAccessLabels

export function isPlaceAccessType(value: string): value is PlaceAccessType {
  return value in placeAccessLabels
}

import type { Place } from '@/payload-types'

import { getPlaceLocationFromPoint } from '@/lib/placesLocation'

export type PlaceMapItem = Pick<
  Place,
  'accessType' | 'city' | 'id' | 'location' | 'region' | 'slug' | 'summary' | 'title'
>

export const getPlaceLocation = (place: PlaceMapItem) => getPlaceLocationFromPoint(place.location)

export const getGoogleMapsUrl = (place: PlaceMapItem) => {
  const location = getPlaceLocation(place)

  if (location) {
    return `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`
  }

  const query = [place.title, place.city, place.region].filter(Boolean).join(', ')

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
