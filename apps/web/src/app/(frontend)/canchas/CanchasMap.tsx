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

const createClubIcon = (index: number, accessType: CanchaMapItem['accessType']) =>
  L.divIcon({
    className: `club-map-marker ${accessType}`,
    html: `<span>${index + 1}</span>`,
    iconAnchor: [16, 16],
    iconSize: [32, 32],
    popupAnchor: [0, -18],
  })

function FitClubBounds({
  locatedCanchas,
}: {
  locatedCanchas: { location: { latitude: number; longitude: number } }[]
}) {
  const map = useMap()

  useEffect(() => {
    if (locatedCanchas.length === 0) return

    const bounds = L.latLngBounds(
      locatedCanchas.map(({ location }) => [location.latitude, location.longitude]),
    )
    map.fitBounds(bounds, { padding: [28, 28] })
  }, [locatedCanchas, map])

  return null
}

export default function CanchasMap({ canchas }: { canchas: CanchaMapItem[] }) {
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
      className="sticky top-6 z-0 min-h-[680px] overflow-hidden rounded-lg border border-line bg-white-soft max-[760px]:relative max-[760px]:top-auto max-[760px]:min-h-80"
      scrollWheelZoom={false}
      zoom={8}
      zoomControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitClubBounds locatedCanchas={locatedCanchas} />
      {locatedCanchas.map(({ cancha, index, location }) => (
        <Marker
          icon={createClubIcon(index, cancha.accessType)}
          key={cancha.id}
          position={[location.latitude, location.longitude]}
        >
          <Popup>
            <div className="grid min-w-40 gap-1 text-ink">
              <strong className="leading-[1.15]">{cancha.title}</strong>
              <span className="text-[13px] text-muted">{canchaAccessLabels[cancha.accessType]}</span>
              {cancha.city || cancha.region ? (
                <span className="text-[13px] text-muted">
                  {[cancha.city, cancha.region].filter(Boolean).join(', ')}
                </span>
              ) : null}
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
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
