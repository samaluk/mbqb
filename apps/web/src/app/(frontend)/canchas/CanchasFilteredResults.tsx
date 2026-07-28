'use client'

import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { canchaAccessLabels, getGoogleMapsUrl } from '@/lib/canchas'
import type { CanchasResultsModel } from '@/lib/canchasBrowsing'
import { formatDistanceKm } from '@/lib/canchasGeo'
import { cn } from '@/lib/utils'

import { CanchasDataTable } from './CanchasDataTable'
import { CanchasMapLoader } from './CanchasMapLoader'
import { CanchasPagination } from './CanchasPagination'

type CanchasFilteredResultsProps = {
  results: CanchasResultsModel
}

export function CanchasFilteredResults({ results }: CanchasFilteredResultsProps) {
  const { mapCanchas, navigation, pagination, showDistance, sort, userGeo, view } = results
  const canchaDocs = pagination.canchas
  const mapCanchaDocs = mapCanchas ?? canchaDocs

  if (view === 'table') {
    return (
      <CanchasDataTable
        canchas={canchaDocs}
        geoSortActive={showDistance}
        pagination={pagination}
        showDistance={showDistance}
        sort={sort}
        sortLinks={navigation.sortLinks}
      />
    )
  }

  return (
    <div className="mt-6 flex flex-col gap-3">
      <div className="grid grid-cols-canchas-cards items-start gap-4 max-[760px]:grid-cols-1 max-[760px]:gap-3">
        <CanchasMapLoader
          canchas={mapCanchaDocs}
          userLocation={
            userGeo ? { latitude: userGeo.latitude, longitude: userGeo.longitude } : null
          }
        />
        <div
          className="grid max-h-170 gap-2 overflow-auto pe-1 max-[760px]:max-h-none max-[760px]:overflow-visible max-[760px]:pe-0"
          aria-label="Listado de canchas"
        >
          {canchaDocs.length ? (
            canchaDocs.map((cancha, index) => (
              <Card className="min-w-0" key={cancha.id} size="sm">
                <CardHeader>
                  <div className="flex items-start gap-2.5">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-green text-label font-black text-white-soft max-[760px]:size-6 max-[760px]:text-xs">
                      {(pagination.page - 1) * pagination.pageSize + index + 1}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{canchaAccessLabels[cancha.accessType]}</Badge>
                      {cancha.region ? <Badge variant="outline">{cancha.region}</Badge> : null}
                      {cancha.city ? <Badge variant="outline">{cancha.city}</Badge> : null}
                      {'distanceKm' in cancha && typeof cancha.distanceKm === 'number' ? (
                        <Badge variant="secondary">{formatDistanceKm(cancha.distanceKm)}</Badge>
                      ) : null}
                    </div>
                  </div>
                  <CardTitle>{cancha.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {cancha.summary ? (
                    <p className="max-w-none text-base text-muted max-[760px]:text-sm max-[760px]:leading-snippet-sm">
                      {cancha.summary}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    <Link
                      className={cn(buttonVariants({ variant: 'link' }), 'font-extrabold')}
                      href={`/canchas/${cancha.slug}`}
                    >
                      Ver ficha
                    </Link>
                    <a
                      className={cn(buttonVariants({ variant: 'link' }), 'font-extrabold')}
                      href={getGoogleMapsUrl(cancha)}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Google Maps
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="min-w-0" size="sm">
              <CardContent className="py-6 text-sm text-muted-foreground">
                {showDistance
                  ? 'No hay canchas con coordenadas dentro del radio elegido. Prueba aumentar la distancia máxima.'
                  : 'No hay canchas para los filtros seleccionados.'}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <CanchasPagination pagination={pagination} />
    </div>
  )
}
