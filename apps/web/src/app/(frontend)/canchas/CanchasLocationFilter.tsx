'use client'

import { LocateFixedIcon, LocateOffIcon } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { defaultMaxDistanceKm, maxMaxDistanceKm, minMaxDistanceKm } from '@/lib/canchasGeo'
import { createStoredUserGeo, type StoredUserGeo } from '@/lib/canchasUserGeo'

import { useCanchasGeo } from './CanchasGeoContext'

function notifyLocationRequired() {
  toast('Comparte tu ubicación para ajustar la distancia máxima.', {
    id: 'canchas-location-required',
  })
}

/** First value of a slider callback payload, falling back to the default. */
const firstSliderValue = (value: readonly number[] | number): number =>
  typeof value === 'number' ? value : (value[0] ?? defaultMaxDistanceKm)

type LocateHandlers = {
  onDenied: (message: string) => void
  onError: (message: string) => void
  onResolved: (geo: StoredUserGeo | null) => void
  fallbackMaxKm: number
}

/** Browser geolocation wrapped so the component only handles outcomes. */
function locateCurrentUser({ fallbackMaxKm, onDenied, onError, onResolved }: LocateHandlers) {
  if (!navigator.geolocation) return onDenied('Tu navegador no permite compartir ubicación.')

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const geo = createStoredUserGeo(
        position.coords.latitude,
        position.coords.longitude,
        fallbackMaxKm,
      )

      if (!geo) return onError('No pudimos guardar tu ubicación. Intenta de nuevo.')

      onResolved(geo)
    },
    () => onError('No pudimos obtener tu ubicación. Revisa los permisos del navegador.'),
    {
      enableHighAccuracy: true,
      maximumAge: 60_000,
      timeout: 15_000,
    },
  )
}

type SetUserGeo = (geo: StoredUserGeo | null) => void

/**
 * Slider state for the maximum distance: optimistic local value plus a
 * debounced persist into the session geo cookie.
 */
function useMaxDistanceControls(userGeo: StoredUserGeo | null, setUserGeo: SetUserGeo) {
  const committedMaxKm = userGeo?.maxKm ?? defaultMaxDistanceKm
  const [sliderMaxKm, setSliderMaxKm] = React.useState(committedMaxKm)
  const [syncedCommittedMaxKm, setSyncedCommittedMaxKm] = React.useState(committedMaxKm)
  const persistMaxKmTimeout = React.useRef<number>(null)

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

  // React Compiler caches these callbacks automatically.
  const cancelPendingPersist = () => {
    if (persistMaxKmTimeout.current) window.clearTimeout(persistMaxKmTimeout.current)
  }

  const persistMaxDistance = (value: number) => {
    if (!userGeo) return notifyLocationRequired()

    cancelPendingPersist()
    setUserGeo({ ...userGeo, maxKm: value })
  }

  const schedulePersistMaxDistance = (value: number) => {
    setSliderMaxKm(value)

    if (!userGeo) return notifyLocationRequired()

    persistMaxKmTimeout.current = window.setTimeout(() => {
      persistMaxDistance(value)
    }, 300)
  }

  const commitMaxDistance = (value: number) => {
    setSliderMaxKm(value)
    cancelPendingPersist()
    persistMaxDistance(value)
  }

  return { commitMaxDistance, persistMaxDistance, schedulePersistMaxDistance, sliderMaxKm }
}

export function CanchasLocationFilter() {
  const { isGeoPending, setUserGeo, userGeo } = useCanchasGeo()
  const [isLocating, setIsLocating] = React.useState(false)
  const [locationError, setLocationError] = React.useState<string | null>(null)
  const hasLocation = userGeo !== null
  const maxDistance = useMaxDistanceControls(userGeo, setUserGeo)

  const requestLocation = () => {
    setIsLocating(true)
    setLocationError(null)

    locateCurrentUser({
      fallbackMaxKm: userGeo?.maxKm ?? defaultMaxDistanceKm,
      onDenied: setLocationError,
      onError: (message) => {
        setIsLocating(false)
        setLocationError(message)
      },
      onResolved: (geo) => {
        setIsLocating(false)
        setUserGeo(geo)
      },
    })
  }

  const clearLocation = () => {
    setLocationError(null)
    setUserGeo(null)
  }

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
        <LocationButtons
          hasLocation={hasLocation}
          isGeoPending={isGeoPending}
          isLocating={isLocating}
          onClear={clearLocation}
          onRequest={requestLocation}
          requestDisabled={isLocating || isGeoPending}
        />
      </div>
      {locationError ? <p className="text-sm text-destructive">{locationError}</p> : null}
      <DistanceControls
        disabled={!hasLocation || isGeoPending}
        maxKm={maxDistance.sliderMaxKm}
        showSummary={hasLocation}
        onCommit={maxDistance.commitMaxDistance}
        onSchedule={maxDistance.schedulePersistMaxDistance}
      />
    </div>
  )
}

const locationButtonLabel = (isLocating: boolean, hasLocation: boolean) =>
  isLocating
    ? 'Obteniendo ubicación...'
    : hasLocation
      ? 'Actualizar ubicación'
      : 'Usar mi ubicación'

function LocationButtons({
  hasLocation,
  requestDisabled,
  isLocating,
  isGeoPending,
  onClear,
  onRequest,
}: {
  hasLocation: boolean
  requestDisabled: boolean
  isGeoPending: boolean
  isLocating: boolean
  onClear: () => void
  onRequest: () => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button disabled={requestDisabled} onClick={onRequest} type="button" variant="outline">
        <LocateFixedIcon data-icon="inline-start" />
        {locationButtonLabel(isLocating, hasLocation)}
      </Button>
      {hasLocation ? (
        <Button disabled={isGeoPending} onClick={onClear} type="button" variant="ghost">
          <LocateOffIcon data-icon="inline-start" />
          Quitar ubicación
        </Button>
      ) : null}
    </div>
  )
}

function DistanceControls({
  disabled,
  maxKm,
  onCommit,
  onSchedule,
  showSummary,
}: {
  disabled: boolean
  maxKm: number
  onCommit: (value: number) => void
  onSchedule: (value: number) => void
  showSummary: boolean
}) {
  return (
    <div className="flex flex-col gap-3">
      {showSummary ? (
        <p className="text-sm text-muted-foreground">
          Mostrando canchas a hasta <strong className="text-foreground">{maxKm} km</strong> de tu
          ubicación actual.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Usa el botón de arriba para compartir tu ubicación y filtrar canchas por distancia.
        </p>
      )}
      <div className="flex flex-col gap-2">
        <Label className="text-xs font-normal text-muted-foreground" htmlFor="canchas-max-distance">
          Distancia máxima: {maxKm} km
        </Label>
        <SliderBlock
          disabled={disabled}
          maxKm={maxKm}
          onCommit={onCommit}
          onSchedule={onSchedule}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{minMaxDistanceKm} km</span>
          <span>{maxMaxDistanceKm} km</span>
        </div>
      </div>
    </div>
  )
}

function SliderBlock({
  disabled,
  maxKm,
  onCommit,
  onSchedule,
}: {
  disabled: boolean
  maxKm: number
  onCommit: (value: number) => void
  onSchedule: (value: number) => void
}) {
  return (
    <div className="relative">
      <Slider
        aria-disabled={disabled}
        aria-label="Distancia máxima en kilómetros"
        disabled={disabled}
        id="canchas-max-distance"
        max={maxMaxDistanceKm}
        min={minMaxDistanceKm}
        onValueChange={(value) => onSchedule(firstSliderValue(value))}
        onValueCommitted={(value) => onCommit(firstSliderValue(value))}
        step={5}
        value={[maxKm]}
      />
      {!disabled ? null : (
        <div
          aria-hidden="true"
          className="absolute inset-0 cursor-not-allowed"
          onPointerDown={(event) => {
            event.preventDefault()
            notifyLocationRequired()
          }}
        />
      )}
    </div>
  )
}
