'use client'

import 'leaflet/dist/leaflet.css'

import L from 'leaflet'
import Link from 'next/link'
import { useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'

import {
  canchaAccessLabels,
  getCanchaLocation,
  getGoogleMapsUrl,
  type CanchaMapItem,
} from '@/lib/canchas'
import { formatDistanceKm, type GeoPoint } from '@/lib/canchasGeo'

const clubMarkerClassByAccess: Record<CanchaMapItem['accessType'], string> = {
  private: 'map-marker-private',
  'pay-and-play': 'map-marker-pay-and-play',
  restricted: 'map-marker-restricted',
  unknown: 'map-marker-unknown',
}

const userLocationMarkerClass = 'map-marker-user'

const createClubIcon = (index: number, accessType: CanchaMapItem['accessType']) =>
  L.divIcon({
    className: clubMarkerClassByAccess[accessType],
    html: `<span>${index + 1}</span>`,
    iconAnchor: [16, 16],
    iconSize: [32, 32],
    popupAnchor: [0, -18],
  })

const userLocationIcon = L.divIcon({
  className: userLocationMarkerClass,
  html: '<span aria-hidden="true">•</span>',
  iconAnchor: [10, 10],
  iconSize: [20, 20],
})

function FitClubBounds({
  locatedCanchas,
  userLocation,
}: {
  locatedCanchas: { location: { latitude: number; longitude: number } }[]
  userLocation: GeoPoint | null
}) {
  const map = useMap()

  useEffect(() => {
    const points: [number, number][] = locatedCanchas.map(({ location }) => [
      location.latitude,
      location.longitude,
    ])

    if (userLocation) {
      points.push([userLocation.latitude, userLocation.longitude])
    }

    if (points.length === 0) return

    const bounds = L.latLngBounds(points)
    map.fitBounds(bounds, { padding: [28, 28] })
  }, [locatedCanchas, map, userLocation])

  return null
}

export default function CanchasMap({
  canchas,
  userLocation,
}: {
  canchas: CanchaMapItem[]
  userLocation: GeoPoint | null
}) {
  const locatedCanchas = canchas
    .map((cancha, index) => ({
      cancha,
      index,
      location: getCanchaLocation(cancha),
    }))
    .filter(
      (
        item,
      ): item is {
        cancha: CanchaMapItem
        index: number
        location: { latitude: number; longitude: number }
      } => Boolean(item.location),
    )

  return (
    <MapContainer
      center={[-33.45, -70.66]}
      className="canchas-map"
      scrollWheelZoom={false}
      zoom={8}
      zoomControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitClubBounds locatedCanchas={locatedCanchas} userLocation={userLocation} />
      {userLocation ? (
        <Marker icon={userLocationIcon} position={[userLocation.latitude, userLocation.longitude]}>
          <Popup>
            <div className="grid min-w-32 gap-1 text-ink">
              <strong className="leading-snug">Tu ubicación</strong>
              <span className="text-label text-muted">Centro del filtro por distancia</span>
            </div>
          </Popup>
        </Marker>
      ) : null}
      {locatedCanchas.map(({ cancha, index, location }) => (
        <Marker
          icon={createClubIcon(index, cancha.accessType)}
          key={cancha.id}
          position={[location.latitude, location.longitude]}
        >
          <Popup>
            <CanchaMarkerPopup cancha={cancha} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

function CanchaMarkerPopup({ cancha }: { cancha: CanchaMapItem }) {
  const location = [cancha.city, cancha.region].filter(Boolean).join(', ')

  return (
    <div className="grid min-w-40 gap-1 text-ink">
      <strong className="leading-snug">{cancha.title}</strong>
      <span className="text-label text-muted">{canchaAccessLabels[cancha.accessType]}</span>
      <CanchaPopupLocationLine cancha={cancha} location={location} />
      <DistanceLine cancha={cancha} />
      <div className="flex flex-wrap gap-3">
        <Link className="font-extrabold text-green" href={`/canchas/${cancha.slug}`}>
          Ver ficha
        </Link>
        <a
          className="font-extrabold text-green"
          href={getGoogleMapsUrl(cancha)}
          rel="noreferrer"
          target="_blank"
        >
          Google Maps
        </a>
      </div>
    </div>
  )
}

function CanchaPopupLocationLine({
  cancha,
  location,
}: {
  cancha: CanchaMapItem
  location: string
}) {
  if (!cancha.city && !cancha.region) return null

  return <span className="text-label text-muted">{location}</span>
}

function DistanceLine({ cancha }: { cancha: CanchaMapItem }) {
  if (!('distanceKm' in cancha) || typeof cancha.distanceKm !== 'number') return null

  return (
    <span className="text-label font-semibold text-green">
      {formatDistanceKm(cancha.distanceKm)}
    </span>
  )
}
