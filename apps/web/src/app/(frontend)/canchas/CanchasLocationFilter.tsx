'use client'

import { LocateFixedIcon, LocateOffIcon } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { defaultMaxDistanceKm, maxMaxDistanceKm, minMaxDistanceKm } from '@/lib/canchasGeo'
import { createStoredUserGeo } from '@/lib/canchasUserGeo'

import { useCanchasGeo } from './CanchasGeoContext'

function notifyLocationRequired() {
  toast('Comparte tu ubicación para ajustar la distancia máxima.', {
    id: 'canchas-location-required',
  })
}

export function CanchasLocationFilter() {
  const { isGeoPending, setUserGeo, userGeo } = useCanchasGeo()
  const [isLocating, setIsLocating] = React.useState(false)
  const [locationError, setLocationError] = React.useState<string | null>(null)
  const persistMaxKmTimeout = React.useRef<number>(null)
  const hasLocation = userGeo !== null
  const committedMaxKm = userGeo?.maxKm ?? defaultMaxDistanceKm
  const [sliderMaxKm, setSliderMaxKm] = React.useState(committedMaxKm)
  const [syncedCommittedMaxKm, setSyncedCommittedMaxKm] = React.useState(committedMaxKm)

  if (committedMaxKm !== syncedCommittedMaxKm) {
    setSyncedCommittedMaxKm(committedMaxKm)
    setSliderMaxKm(committedMaxKm)
  }

  React.useEffect(
    () => () => {
      if (persistMaxKmTimeout.current) window.clearTimeout(persistMaxKmTimeout.current)
    },
    [],
  )

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Tu navegador no permite compartir ubicación.')
      return
    }

    setIsLocating(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false)
        const geo = createStoredUserGeo(
          position.coords.latitude,
          position.coords.longitude,
          userGeo?.maxKm ?? defaultMaxDistanceKm,
        )

        if (!geo) {
          setLocationError('No pudimos guardar tu ubicación. Intenta de nuevo.')
          return
        }

        setUserGeo(geo)
      },
      () => {
        setIsLocating(false)
        setLocationError('No pudimos obtener tu ubicación. Revisa los permisos del navegador.')
      },
      {
        enableHighAccuracy: true,
        maximumAge: 60_000,
        timeout: 15_000,
      },
    )
  }

  const clearLocation = () => {
    setLocationError(null)
    setUserGeo(null)
  }

  const persistMaxDistance = React.useCallback(
    (value: number) => {
      if (!userGeo) {
        notifyLocationRequired()
        return
      }

      if (persistMaxKmTimeout.current) window.clearTimeout(persistMaxKmTimeout.current)

      setUserGeo({
        ...userGeo,
        maxKm: value,
      })
    },
    [setUserGeo, userGeo],
  )

  const schedulePersistMaxDistance = React.useCallback(
    (value: number) => {
      if (!userGeo) {
        notifyLocationRequired()
        return
      }

      setSliderMaxKm(value)

      if (persistMaxKmTimeout.current) window.clearTimeout(persistMaxKmTimeout.current)

      persistMaxKmTimeout.current = window.setTimeout(() => {
        persistMaxDistance(value)
      }, 300)
    },
    [persistMaxDistance, userGeo],
  )

  const commitMaxDistance = React.useCallback(
    (value: number) => {
      if (!userGeo) {
        notifyLocationRequired()
        return
      }

      setSliderMaxKm(value)

      if (persistMaxKmTimeout.current) {
        window.clearTimeout(persistMaxKmTimeout.current)
        persistMaxKmTimeout.current = null
      }

      persistMaxDistance(value)
    },
    [persistMaxDistance, userGeo],
  )

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Label className="text-sm font-medium text-foreground" htmlFor="canchas-max-distance">
            Cerca de ti
          </Label>
          <p className="max-w-prose text-sm text-muted-foreground">
            Tu ubicación se guarda en una cookie de sesión segura en este navegador. No se incluye
            al compartir el enlace de la página.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={isLocating || isGeoPending}
            onClick={requestLocation}
            type="button"
            variant="outline"
          >
            <LocateFixedIcon data-icon="inline-start" />
            {isLocating
              ? 'Obteniendo ubicación...'
              : hasLocation
                ? 'Actualizar ubicación'
                : 'Usar mi ubicación'}
          </Button>
          {hasLocation ? (
            <Button disabled={isGeoPending} onClick={clearLocation} type="button" variant="ghost">
              <LocateOffIcon data-icon="inline-start" />
              Quitar ubicación
            </Button>
          ) : null}
        </div>
      </div>
      {locationError ? <p className="text-sm text-destructive">{locationError}</p> : null}
      <div className="flex flex-col gap-3">
        {hasLocation ? (
          <p className="text-sm text-muted-foreground">
            Mostrando canchas a hasta <strong className="text-foreground">{sliderMaxKm} km</strong>{' '}
            de tu ubicación actual.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Usa el botón de arriba para compartir tu ubicación y filtrar canchas por distancia.
          </p>
        )}
        <div className="flex flex-col gap-2">
          <Label
            className="text-xs font-normal text-muted-foreground"
            htmlFor="canchas-max-distance"
          >
            Distancia máxima: {sliderMaxKm} km
          </Label>
          <div className="relative">
            <Slider
              aria-disabled={!hasLocation || isGeoPending}
              aria-label="Distancia máxima en kilómetros"
              disabled={!hasLocation || isGeoPending}
              id="canchas-max-distance"
              max={maxMaxDistanceKm}
              min={minMaxDistanceKm}
              onValueChange={(value) =>
                schedulePersistMaxDistance(
                  // oxlint-disable-next-line typescript/no-unsafe-argument
                  (Array.isArray(value) ? value[0] : value) ?? defaultMaxDistanceKm,
                )
              }
              onValueCommitted={(value) =>
                commitMaxDistance(
                  // oxlint-disable-next-line typescript/no-unsafe-argument
                  (Array.isArray(value) ? value[0] : value) ?? defaultMaxDistanceKm,
                )
              }
              step={5}
              value={[sliderMaxKm]}
            />
            {!hasLocation ? (
              <div
                aria-hidden="true"
                className="absolute inset-0 cursor-not-allowed"
                onPointerDown={(event) => {
                  event.preventDefault()
                  notifyLocationRequired()
                }}
              />
            ) : null}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{minMaxDistanceKm} km</span>
            <span>{maxMaxDistanceKm} km</span>
          </div>
        </div>
      </div>
    </div>
  )
}
