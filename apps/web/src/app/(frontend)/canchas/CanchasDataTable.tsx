import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ExternalLinkIcon,
} from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

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

import { CanchasColumnControls } from './CanchasColumnControls'
import { CanchasPageSizeSelect } from './CanchasPageSizeSelect'

type CanchasDataTableProps = {
  canchas: CanchaMapItem[]
  page: number
  pageSize: number
  searchParams: Record<string, string | string[] | undefined>
  sort: CanchasSort
  totalDocs: number
  totalPages: number
}

export type CanchasSort = {
  direction: 'asc' | 'desc'
  field: 'accessType' | 'city' | 'region' | 'title'
}

const columnLabels = {
  accessType: 'Acceso',
  actions: 'Acciones',
  city: 'Ciudad',
  region: 'Region',
  summary: 'Resumen',
  title: 'Cancha',
} as const

const hideableColumns = ['accessType', 'region', 'city', 'summary'] as const

export function CanchasDataTable({
  canchas,
  page,
  pageSize,
  searchParams,
  sort,
  totalDocs,
  totalPages,
}: CanchasDataTableProps) {
  const firstRow = totalDocs === 0 ? 0 : (page - 1) * pageSize + 1
  const lastRow = Math.min(page * pageSize, totalDocs)

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {firstRow}-{lastRow} de {totalDocs} canchas
        </div>
        <CanchasColumnControls
          columns={hideableColumns.map((id) => ({ id, label: columnLabels[id] }))}
        />
      </div>
      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead data-column="title">
                <SortLink
                  label={columnLabels.title}
                  searchParams={searchParams}
                  sort={sort}
                  sortField="title"
                />
              </TableHead>
              <TableHead data-column="accessType">
                <SortLink
                  label={columnLabels.accessType}
                  searchParams={searchParams}
                  sort={sort}
                  sortField="accessType"
                />
              </TableHead>
              <TableHead data-column="region">
                <SortLink
                  label={columnLabels.region}
                  searchParams={searchParams}
                  sort={sort}
                  sortField="region"
                />
              </TableHead>
              <TableHead data-column="city">
                <SortLink
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
                <TableCell className="h-24 text-center text-muted-foreground" colSpan={6}>
                  no fields found for selected filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filas</span>
          <CanchasPageSizeSelect pageSize={pageSize} searchParams={searchParams} />
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium">
            Pagina {page} de {Math.max(totalPages, 1)}
          </div>
          <div className="flex items-center gap-1">
            <PaginationButton disabled={page <= 1} href={getTableHref(searchParams, { page: '1' })}>
              <ChevronsLeftIcon />
              <span className="sr-only">Primera pagina</span>
            </PaginationButton>
            <PaginationButton
              disabled={page <= 1}
              href={getTableHref(searchParams, { page: `${page - 1}` })}
            >
              <ChevronLeftIcon />
              <span className="sr-only">Pagina anterior</span>
            </PaginationButton>
            <PaginationButton
              disabled={page >= totalPages}
              href={getTableHref(searchParams, { page: `${page + 1}` })}
            >
              <ChevronRightIcon />
              <span className="sr-only">Pagina siguiente</span>
            </PaginationButton>
            <PaginationButton
              disabled={page >= totalPages}
              href={getTableHref(searchParams, { page: `${totalPages}` })}
            >
              <ChevronsRightIcon />
              <span className="sr-only">Ultima pagina</span>
            </PaginationButton>
          </div>
        </div>
      </div>
    </div>
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
        href={getTableHref(searchParams, {
          page: null,
          sort: `${nextDirection === 'desc' ? '-' : ''}${sortField}`,
        })}
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

function PaginationButton({
  children,
  disabled,
  href,
}: {
  children: ReactNode
  disabled: boolean
  href: string
}) {
  if (disabled) {
    return (
      <Button disabled size="icon-sm" type="button" variant="outline">
        {children}
      </Button>
    )
  }

  return (
    <Button asChild size="icon-sm" variant="outline">
      <Link href={href}>{children}</Link>
    </Button>
  )
}

function getTableHref(
  searchParams: Record<string, string | string[] | undefined>,
  updates: Record<string, null | string>,
) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(searchParams)) {
    const paramValue = Array.isArray(value) ? value[0] : value
    if (paramValue) params.set(key, paramValue)
  }

  params.set('view', 'table')

  for (const [key, value] of Object.entries(updates)) {
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
  }

  const query = params.toString()

  return query ? `/canchas?${query}` : '/canchas'
}
