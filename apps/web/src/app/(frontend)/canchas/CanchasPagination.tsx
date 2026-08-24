import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button-variants'
import type { CanchasPaginationLink, CanchasPaginationModel } from '@/lib/canchasBrowsing'
import { cn } from '@/lib/utils'

import { CanchasPageSizeSelect } from './CanchasPageSizeSelect'

export type CanchasPaginationProps = {
  pagination: CanchasPaginationModel
}

export function CanchasPagination({ pagination }: CanchasPaginationProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="text-sm text-muted-foreground">{pagination.label}</div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filas</span>
          <CanchasPageSizeSelect pagination={pagination} />
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium">{pagination.pageLabel}</div>
          <div className="flex items-center gap-1">
            <PaginationButton link={pagination.links.first}>
              <ChevronsLeftIcon />
              <span className="sr-only">Primera pagina</span>
            </PaginationButton>
            <PaginationButton link={pagination.links.previous}>
              <ChevronLeftIcon />
              <span className="sr-only">Pagina anterior</span>
            </PaginationButton>
            <PaginationButton link={pagination.links.next}>
              <ChevronRightIcon />
              <span className="sr-only">Pagina siguiente</span>
            </PaginationButton>
            <PaginationButton link={pagination.links.last}>
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
  link,
}: {
  children: ReactNode
  link: CanchasPaginationLink
}) {
  if (link.disabled) {
    return (
      <Button disabled size="icon-sm" type="button" variant="outline">
        {children}
      </Button>
    )
  }

  return (
    <Link className={cn(buttonVariants({ size: 'icon-sm', variant: 'outline' }))} href={link.href}>
      {children}
    </Link>
  )
}
