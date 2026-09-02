'use client'

import 'leaflet/dist/leaflet.css'

import L from 'leaflet'
import Link from 'next/link'
import { useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'

import {
  getPlaceLocation,
  getGoogleMapsUrl,
  placeAccessLabels,
  type PlaceMapItem,
} from '@/lib/places'
import { formatDistanceKm, type GeoPoint } from '@/lib/placesGeo'

const placeMarkerClassByAccess: Record<PlaceMapItem['accessType'], string> = {
  open: 'map-marker-open',
  private: 'map-marker-private',
  restricted: 'map-marker-restricted',
}

const userLocationMarkerClass = 'map-marker-user'

const createPlaceIcon = (index: number, accessType: PlaceMapItem['accessType']) =>
  L.divIcon({
    className: placeMarkerClassByAccess[accessType],
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

function FitPlaceBounds({
  locatedPlaces,
  userLocation,
}: {
  locatedPlaces: { location: { latitude: number; longitude: number } }[]
  userLocation: GeoPoint | null
}) {
  const map = useMap()

  useEffect(() => {
    const points: [number, number][] = locatedPlaces.map(({ location }) => [
      location.latitude,
      location.longitude,
    ])

    if (userLocation) {
      points.push([userLocation.latitude, userLocation.longitude])
    }

    if (points.length === 0) return

    const bounds = L.latLngBounds(points)
    map.fitBounds(bounds, { padding: [28, 28] })
  }, [locatedPlaces, map, userLocation])

  return null
}

export default function PlacesMap({
  places,
  userLocation,
}: {
  places: PlaceMapItem[]
  userLocation: GeoPoint | null
}) {
  const locatedPlaces = places
    .map((place, index) => ({
      index,
      location: getPlaceLocation(place),
      place,
    }))
    .filter(
      (
        item,
      ): item is {
        index: number
        location: { latitude: number; longitude: number }
        place: PlaceMapItem
      } => Boolean(item.location),
    )

  return (
    <MapContainer
      center={[-33.45, -70.66]}
      className="places-map"
      scrollWheelZoom={false}
      zoom={8}
      zoomControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitPlaceBounds locatedPlaces={locatedPlaces} userLocation={userLocation} />
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
      {locatedPlaces.map(({ index, location, place }) => (
        <Marker
          icon={createPlaceIcon(index, place.accessType)}
          key={place.id}
          position={[location.latitude, location.longitude]}
        >
          <Popup>
            <PlaceMarkerPopup place={place} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

function PlaceMarkerPopup({ place }: { place: PlaceMapItem }) {
  const location = [place.city, place.region].filter(Boolean).join(', ')

  return (
    <div className="grid min-w-40 gap-1 text-ink">
      <strong className="leading-snug">{place.title}</strong>
      <span className="text-label text-muted">{placeAccessLabels[place.accessType]}</span>
      <PlacePopupLocationLine location={location} place={place} />
      <DistanceLine place={place} />
      <div className="flex flex-wrap gap-3">
        <Link className="font-extrabold text-green" href={`/places/${place.slug}`}>
          Ver ficha
        </Link>
        <a
          className="font-extrabold text-green"
          href={getGoogleMapsUrl(place)}
          rel="noreferrer"
          target="_blank"
        >
          Google Maps
        </a>
      </div>
    </div>
  )
}

function PlacePopupLocationLine({ location, place }: { location: string; place: PlaceMapItem }) {
  if (!place.city && !place.region) return null

  return <span className="text-label text-muted">{location}</span>
}

function DistanceLine({ place }: { place: PlaceMapItem }) {
  if (!('distanceKm' in place) || typeof place.distanceKm !== 'number') return null

  return (
    <span className="text-label font-semibold text-green">
      {formatDistanceKm(place.distanceKm)}
    </span>
  )
}
