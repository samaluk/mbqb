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
import type { CanchasSort } from '@/lib/canchasBrowsing'
import { formatDistanceKm } from '@/lib/canchasGeo'

import { getCanchasHref } from './canchasSearchParams'
import { CanchasColumnControls } from './CanchasColumnControls'
import { CanchasPagination } from './CanchasPagination'

type CanchasDataTableProps = {
  canchas: CanchaMapItem[]
  geoSortActive?: boolean
  page: number
  pageSize: number
  searchParams: Record<string, string | string[] | undefined>
  showDistance?: boolean
  sort: CanchasSort
  totalDocs: number
  totalPages: number
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
  page,
  pageSize,
  searchParams,
  showDistance = false,
  sort,
  totalDocs,
  totalPages,
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
                  searchParams={searchParams}
                  sort={sort}
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
                  searchParams={searchParams}
                  sort={sort}
                  sortField="accessType"
                />
              </TableHead>
              <TableHead data-column="region">
                <ColumnLabel
                  geoSortActive={geoSortActive}
                  label={columnLabels.region}
                  searchParams={searchParams}
                  sort={sort}
                  sortField="region"
                />
              </TableHead>
              <TableHead data-column="city">
                <ColumnLabel
                  geoSortActive={geoSortActive}
                  label={columnLabels.city}
                  searchParams={searchParams}
                  sort={sort}
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
                    <Button
                      asChild
                      className="h-auto justify-start px-0 py-0 text-left"
                      variant="link"
                    >
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
                    <span className="block max-w-[420px] truncate text-muted-foreground">
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
      <CanchasPagination
        page={page}
        pageSize={pageSize}
        searchParams={searchParams}
        totalDocs={totalDocs}
        totalPages={totalPages}
        view="table"
      />
    </div>
  )
}

function ColumnLabel({
  geoSortActive,
  label,
  searchParams,
  sort,
  sortField,
}: {
  geoSortActive: boolean
  label: string
  searchParams: Record<string, string | string[] | undefined>
  sort: CanchasSort
  sortField: CanchasSort['field']
}) {
  if (geoSortActive) {
    return <span>{label}</span>
  }

  return (
    <SortLink
      label={label}
      searchParams={searchParams}
      sort={sort}
      sortField={sortField}
    />
  )
}

function SortLink({
  label,
  searchParams,
  sort,
  sortField,
}: {
  label: string
  searchParams: Record<string, string | string[] | undefined>
  sort: CanchasSort
  sortField: CanchasSort['field']
}) {
  const active = sort.field === sortField
  const nextDirection = active && sort.direction === 'asc' ? 'desc' : 'asc'

  return (
    <Button asChild className="px-0" size="sm" type="button" variant="ghost">
      <Link
        href={getCanchasHref(
          searchParams,
          {
            page: null,
            sort: `${nextDirection === 'desc' ? '-' : ''}${sortField}`,
          },
          { view: 'table' },
        )}
      >
        {label}
        <ChevronDownIcon
          className={active && sort.direction === 'asc' ? 'rotate-180' : undefined}
          data-icon="inline-end"
        />
      </Link>
    </Button>
  )
}
