import { ChevronDownIcon, ExternalLinkIcon } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { canchaAccessLabels, getGoogleMapsUrl, type CanchaMapItem } from '@/lib/canchas'
import type { CanchasPaginationModel, CanchasSort, CanchasSortLink } from '@/lib/canchasBrowsing'
import { formatDistanceKm } from '@/lib/canchasGeo'

import { CanchasColumnControls } from './CanchasColumnControls'
import { CanchasPagination } from './CanchasPagination'

type CanchasDataTableProps = {
  canchas: CanchaMapItem[]
  geoSortActive?: boolean
  pagination: CanchasPaginationModel
  showDistance?: boolean
  sort: CanchasSort
  sortLinks: Record<CanchasSort['field'], CanchasSortLink>
}

const columnLabels = {
  accessType: 'Acceso',
  actions: 'Acciones',
  city: 'Ciudad',
  distance: 'Distancia',
  region: 'Region',
  summary: 'Resumen',
  title: 'Cancha',
} as const

const hideableColumns = ['accessType', 'region', 'city', 'summary'] as const

export function CanchasDataTable({
  canchas,
  geoSortActive = false,
  pagination,
  showDistance = false,
  sort,
  sortLinks,
}: CanchasDataTableProps) {
  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex items-center justify-end gap-3">
        <CanchasColumnControls
          columns={hideableColumns.map((id) => ({ id, label: columnLabels[id] }))}
        />
      </div>
      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead data-column="title">
                <ColumnLabel
                  geoSortActive={geoSortActive}
                  label={columnLabels.title}
                  sort={sort}
                  sortLink={sortLinks.title}
                  sortField="title"
                />
              </TableHead>
              {showDistance ? (
                <TableHead data-column="distance">{columnLabels.distance}</TableHead>
              ) : null}
              <TableHead data-column="accessType">
                <ColumnLabel
                  geoSortActive={geoSortActive}
                  label={columnLabels.accessType}
                  sort={sort}
                  sortLink={sortLinks.accessType}
                  sortField="accessType"
                />
              </TableHead>
              <TableHead data-column="region">
                <ColumnLabel
                  geoSortActive={geoSortActive}
                  label={columnLabels.region}
                  sort={sort}
                  sortLink={sortLinks.region}
                  sortField="region"
                />
              </TableHead>
              <TableHead data-column="city">
                <ColumnLabel
                  geoSortActive={geoSortActive}
                  label={columnLabels.city}
                  sort={sort}
                  sortLink={sortLinks.city}
                  sortField="city"
                />
              </TableHead>
              <TableHead data-column="summary">{columnLabels.summary}</TableHead>
              <TableHead data-column="actions">
                <span className="sr-only">{columnLabels.actions}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {canchas.length ? (
              canchas.map((cancha) => (
                <TableRow key={cancha.id}>
                  <TableCell data-column="title">
                    <Button asChild className="h-auto justify-start p-0 text-left" variant="link">
                      <Link href={`/canchas/${cancha.slug}`}>{cancha.title}</Link>
                    </Button>
                  </TableCell>
                  {showDistance ? (
                    <TableCell data-column="distance">
                      {'distanceKm' in cancha && typeof cancha.distanceKm === 'number'
                        ? formatDistanceKm(cancha.distanceKm)
                        : '—'}
                    </TableCell>
                  ) : null}
                  <TableCell data-column="accessType">
                    <Badge variant="outline">{canchaAccessLabels[cancha.accessType]}</Badge>
                  </TableCell>
                  <TableCell data-column="region">{cancha.region || 'Sin region'}</TableCell>
                  <TableCell data-column="city">{cancha.city || 'Sin ciudad'}</TableCell>
                  <TableCell data-column="summary">
                    <span className="block max-w-105 truncate text-muted-foreground">
                      {cancha.summary || 'Sin resumen'}
                    </span>
                  </TableCell>
                  <TableCell data-column="actions">
                    <div className="flex justify-end gap-1">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/canchas/${cancha.slug}`}>Ver ficha</Link>
                      </Button>
                      <Button asChild size="icon-sm" variant="outline">
                        <a href={getGoogleMapsUrl(cancha)} rel="noreferrer" target="_blank">
                          <ExternalLinkIcon />
                          <span className="sr-only">Google Maps</span>
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center text-muted-foreground"
                  colSpan={showDistance ? 7 : 6}
                >
                  no fields found for selected filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <CanchasPagination pagination={pagination} />
    </div>
  )
}

function ColumnLabel({
  geoSortActive,
  label,
  sort,
  sortLink,
  sortField,
}: {
  geoSortActive: boolean
  label: string
  sort: CanchasSort
  sortLink: CanchasSortLink
  sortField: CanchasSort['field']
}) {
  if (geoSortActive) {
    return <span>{label}</span>
  }

  return <SortLink label={label} sort={sort} sortLink={sortLink} sortField={sortField} />
}

function SortLink({
  label,
  sort,
  sortLink,
  sortField,
}: {
  label: string
  sort: CanchasSort
  sortLink: CanchasSortLink
  sortField: CanchasSort['field']
}) {
  const active = sort.field === sortField

  return (
    <Button asChild className="px-0" size="sm" type="button" variant="ghost">
      <Link href={sortLink.href}>
        {label}
        <ChevronDownIcon
          className={active && sort.direction === 'asc' ? 'rotate-180' : undefined}
          data-icon="inline-end"
        />
      </Link>
    </Button>
  )
}
