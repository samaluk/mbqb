"use client"

import Link from "next/link"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { canchaAccessLabels, getGoogleMapsUrl, type CanchaMapItem } from "@/lib/canchas"
import {
  annotateCanchasWithDistance,
  filterCanchasWithinRadius,
  formatDistanceKm,
  paginateCanchas,
  sortCanchasByDistance,
} from "@/lib/canchasGeo"

import { useCanchasGeo } from "./CanchasGeoContext"
import { CanchasDataTable, type CanchasSort } from "./CanchasDataTable"
import { CanchasMapLoader } from "./CanchasMapLoader"
import { CanchasPagination } from "./CanchasPagination"

type CanchasFilteredResultsProps = {
  canchaPool: CanchaMapItem[]
  filters: {
    page: number
    pageSize: number
    sort: CanchasSort
  }
  searchParams: Record<string, string | string[] | undefined>
  serverTable?: {
    canchas: CanchaMapItem[]
    page: number
    totalDocs: number
    totalPages: number
  }
  view: "cards" | "table"
}

export function CanchasFilteredResults({
  canchaPool,
  filters,
  searchParams,
  serverTable,
  view,
}: CanchasFilteredResultsProps) {
  const { hasGeoFilter, userGeo } = useCanchasGeo()

  const geoFilteredCanchas = React.useMemo(() => {
    if (!userGeo) return null

    return sortCanchasByDistance(
      filterCanchasWithinRadius(
        annotateCanchasWithDistance(canchaPool, userGeo),
        userGeo.maxKm,
      ),
    )
  }, [canchaPool, userGeo])

  const paginatedCanchas = React.useMemo(() => {
    if (hasGeoFilter && geoFilteredCanchas) {
      return paginateCanchas(geoFilteredCanchas, filters.page, filters.pageSize)
    }

    if (view === "table" && serverTable) {
      return {
        docs: serverTable.canchas,
        page: serverTable.page,
        totalDocs: serverTable.totalDocs,
        totalPages: serverTable.totalPages,
      }
    }

    return paginateCanchas(canchaPool, filters.page, filters.pageSize)
  }, [
    filters.page,
    filters.pageSize,
    geoFilteredCanchas,
    hasGeoFilter,
    canchaPool,
    serverTable,
    view,
  ])

  const canchaDocs = paginatedCanchas.docs
  const mapCanchaDocs = hasGeoFilter && geoFilteredCanchas ? geoFilteredCanchas : canchaPool

  if (view === "table") {
    return (
      <CanchasDataTable
        canchas={canchaDocs}
        page={paginatedCanchas.page}
        pageSize={filters.pageSize}
        searchParams={searchParams}
        showDistance={hasGeoFilter}
        sort={filters.sort}
        totalDocs={paginatedCanchas.totalDocs}
        totalPages={paginatedCanchas.totalPages}
      />
    )
  }

  return (
    <div className="mt-6 flex flex-col gap-3">
      <div className="grid grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)] items-start gap-4 max-[760px]:grid-cols-1 max-[760px]:gap-3">
        <CanchasMapLoader
          canchas={mapCanchaDocs}
          userLocation={userGeo ? { latitude: userGeo.latitude, longitude: userGeo.longitude } : null}
        />
        <div
          className="grid max-h-[680px] gap-2 overflow-auto pr-1 max-[760px]:max-h-none max-[760px]:overflow-visible max-[760px]:pr-0"
          aria-label="Listado de canchas"
        >
          {canchaDocs.length ? (
            canchaDocs.map((cancha, index) => (
              <Card className="compact-card min-w-0" key={cancha.id}>
                <CardHeader>
                  <div className="flex items-start gap-2.5">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-green text-[13px] font-black text-white-soft max-[760px]:size-6 max-[760px]:text-xs">
                      {(filters.page - 1) * filters.pageSize + index + 1}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{canchaAccessLabels[cancha.accessType]}</Badge>
                      {cancha.region ? <Badge variant="outline">{cancha.region}</Badge> : null}
                      {cancha.city ? <Badge variant="outline">{cancha.city}</Badge> : null}
                      {"distanceKm" in cancha && typeof cancha.distanceKm === "number" ? (
                        <Badge variant="secondary">{formatDistanceKm(cancha.distanceKm)}</Badge>
                      ) : null}
                    </div>
                  </div>
                  <CardTitle className="compact-card-title">{cancha.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {cancha.summary ? (
                    <p className="max-w-none text-base text-muted max-[760px]:text-sm max-[760px]:leading-[1.4]">
                      {cancha.summary}
                    </p>
                  ) : null}
                  <div className="compact-actions">
                    <Button asChild className="font-extrabold" variant="link">
                      <Link href={`/canchas/${cancha.slug}`}>Ver ficha</Link>
                    </Button>
                    <Button asChild className="font-extrabold" variant="link">
                      <a href={getGoogleMapsUrl(cancha)} rel="noreferrer" target="_blank">
                        Google Maps
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="compact-card min-w-0">
              <CardContent className="py-6 text-sm text-muted-foreground">
                {hasGeoFilter
                  ? "No hay canchas con coordenadas dentro del radio elegido. Prueba aumentar la distancia máxima."
                  : "No hay canchas para los filtros seleccionados."}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <CanchasPagination
        page={paginatedCanchas.page}
        pageSize={filters.pageSize}
        searchParams={searchParams}
        totalDocs={paginatedCanchas.totalDocs}
        totalPages={paginatedCanchas.totalPages}
        view="cards"
      />
    </div>
  )
}
