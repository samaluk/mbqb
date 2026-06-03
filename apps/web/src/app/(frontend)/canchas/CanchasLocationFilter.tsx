"use client"

import { LocateFixedIcon, LocateOffIcon } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  defaultMaxDistanceKm,
  maxMaxDistanceKm,
  minMaxDistanceKm,
} from "@/lib/canchasGeo"
import { createStoredUserGeo } from "@/lib/canchasUserGeo"

import { useCanchasGeo } from "./CanchasGeoContext"

export function CanchasLocationFilter() {
  const { isGeoPending, setUserGeo, userGeo } = useCanchasGeo()
  const [isLocating, setIsLocating] = React.useState(false)
  const [locationError, setLocationError] = React.useState<string | null>(null)
  const sliderTimeout = React.useRef<number>(null)
  const hasLocation = userGeo !== null
  const activeMaxKm = userGeo?.maxKm ?? defaultMaxDistanceKm

  React.useEffect(
    () => () => {
      if (sliderTimeout.current) window.clearTimeout(sliderTimeout.current)
    },
    [],
  )

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Tu navegador no permite compartir ubicación.")
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
          setLocationError("No pudimos guardar tu ubicación. Intenta de nuevo.")
          return
        }

        setUserGeo(geo)
      },
      () => {
        setIsLocating(false)
        setLocationError("No pudimos obtener tu ubicación. Revisa los permisos del navegador.")
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

  const updateMaxDistance = (value: number) => {
    if (!userGeo) return

    if (sliderTimeout.current) window.clearTimeout(sliderTimeout.current)

    sliderTimeout.current = window.setTimeout(() => {
      setUserGeo({
        ...userGeo,
        maxKm: value,
      })
    }, 200)
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Label className="text-sm font-medium text-foreground" htmlFor="canchas-max-distance">
            Cerca de ti
          </Label>
          <p className="max-w-prose text-sm text-muted-foreground">
            Tu ubicación se guarda en una cookie de sesión segura en este navegador. No se incluye al
            compartir el enlace de la página.
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
              ? "Obteniendo ubicación..."
              : hasLocation
                ? "Actualizar ubicación"
                : "Usar mi ubicación"}
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
      {hasLocation ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Mostrando canchas a hasta <strong className="text-foreground">{activeMaxKm} km</strong> de
            tu ubicación actual.
          </p>
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-normal text-muted-foreground" htmlFor="canchas-max-distance">
              Distancia máxima: {activeMaxKm} km
            </Label>
            <Slider
              aria-label="Distancia máxima en kilómetros"
              disabled={isGeoPending}
              id="canchas-max-distance"
              max={maxMaxDistanceKm}
              min={minMaxDistanceKm}
              onValueChange={(values) => updateMaxDistance(values[0] ?? defaultMaxDistanceKm)}
              step={5}
              value={[activeMaxKm]}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{minMaxDistanceKm} km</span>
              <span>{maxMaxDistanceKm} km</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
