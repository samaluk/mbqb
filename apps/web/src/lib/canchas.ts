export const canchaAccessLabels = {
  private: 'Privada',
  'pay-and-play': 'Pay and play',
  restricted: 'Restringida',
  unknown: 'Por confirmar',
}

import type { Cancha } from '@/payload-types'

import { getCanchaLocationFromPoint } from '@/lib/canchasLocation'

export type CanchaMapItem = Pick<
  Cancha,
  'accessType' | 'city' | 'id' | 'location' | 'region' | 'slug' | 'summary' | 'title'
>

export const getCanchaLocation = (cancha: CanchaMapItem) =>
  getCanchaLocationFromPoint(cancha.location)

export const getGoogleMapsUrl = (cancha: CanchaMapItem) => {
  const location = getCanchaLocation(cancha)

  if (location) {
    return `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`
  }

  const query = [cancha.title, cancha.city, cancha.region, 'Chile'].filter(Boolean).join(', ')

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
