'use client'

import { ChevronDownIcon, Columns3Icon } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type PlacesColumnControlsProps = {
  columns: {
    id: string
    label: string
  }[]
}

export function PlacesColumnControls({ columns }: PlacesColumnControlsProps) {
  const [hiddenColumns, setHiddenColumns] = React.useState<Set<string>>(() => new Set())

  React.useEffect(() => {
    for (const column of columns) {
      document.querySelectorAll<HTMLElement>(`[data-column="${column.id}"]`).forEach((element) => {
        element.hidden = hiddenColumns.has(column.id)
      })
    }
  }, [columns, hiddenColumns])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button size="sm" variant="outline" />}>
        <Columns3Icon data-icon="inline-start" />
        Columnas
        <ChevronDownIcon data-icon="inline-end" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            checked={!hiddenColumns.has(column.id)}
            key={column.id}
            onCheckedChange={(checked) => {
              setHiddenColumns((current) => {
                const next = new Set(current)

                if (checked) {
                  next.delete(column.id)
                } else {
                  next.add(column.id)
                }

                return next
              })
            }}
          >
            {column.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
