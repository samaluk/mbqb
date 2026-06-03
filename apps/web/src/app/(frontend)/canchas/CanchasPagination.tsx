import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'

import { getCanchasHref } from './canchasSearchParams'
import { CanchasPageSizeSelect } from './CanchasPageSizeSelect'

type CanchasPaginationProps = {
  page: number
  pageSize: number
  searchParams: Record<string, string | string[] | undefined>
  totalDocs: number
  totalPages: number
  view: 'cards' | 'table'
}

export function CanchasPagination({
  page,
  pageSize,
  searchParams,
  totalDocs,
  totalPages,
  view,
}: CanchasPaginationProps) {
  const firstRow = totalDocs === 0 ? 0 : (page - 1) * pageSize + 1
  const lastRow = Math.min(page * pageSize, totalDocs)
  const hrefOptions = view === 'table' ? { view: 'table' as const } : undefined

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="text-sm text-muted-foreground">
        {firstRow}-{lastRow} de {totalDocs} canchas
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filas</span>
          <CanchasPageSizeSelect pageSize={pageSize} searchParams={searchParams} view={view} />
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium">
            Pagina {page} de {Math.max(totalPages, 1)}
          </div>
          <div className="flex items-center gap-1">
            <PaginationButton
              disabled={page <= 1}
              href={getCanchasHref(searchParams, { page: '1' }, hrefOptions)}
            >
              <ChevronsLeftIcon />
              <span className="sr-only">Primera pagina</span>
            </PaginationButton>
            <PaginationButton
              disabled={page <= 1}
              href={getCanchasHref(searchParams, { page: `${page - 1}` }, hrefOptions)}
            >
              <ChevronLeftIcon />
              <span className="sr-only">Pagina anterior</span>
            </PaginationButton>
            <PaginationButton
              disabled={page >= totalPages}
              href={getCanchasHref(searchParams, { page: `${page + 1}` }, hrefOptions)}
            >
              <ChevronRightIcon />
              <span className="sr-only">Pagina siguiente</span>
            </PaginationButton>
            <PaginationButton
              disabled={page >= totalPages}
              href={getCanchasHref(searchParams, { page: `${totalPages}` }, hrefOptions)}
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
