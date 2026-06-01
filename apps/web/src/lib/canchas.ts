import { canchaLocations } from './canchaLocations'

export const canchaAccessLabels = {
  private: 'Privada',
  'pay-and-play': 'Pay and play',
  restricted: 'Restringida',
  unknown: 'Por confirmar',
}

export type CanchaMapItem = {
  accessType: keyof typeof canchaAccessLabels
  city?: null | string
  id: number | string
  latitude?: null | number
  longitude?: null | number
  region?: null | string
  slug: string
  summary?: null | string
  title: string
}

export const getCanchaLocation = (cancha: CanchaMapItem) => {
  if (typeof cancha.latitude === 'number' && typeof cancha.longitude === 'number') {
    return { latitude: cancha.latitude, longitude: cancha.longitude }
  }

  return canchaLocations[cancha.slug]
}

export const getGoogleMapsUrl = (cancha: CanchaMapItem) => {
  const location = getCanchaLocation(cancha)

  if (location) {
    return `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`
  }

  const query = [cancha.title, cancha.city, cancha.region, 'Chile'].filter(Boolean).join(', ')

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
