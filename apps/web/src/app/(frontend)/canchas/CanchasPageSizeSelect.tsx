'use client'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CanchasPaginationModel } from '@/lib/canchasBrowsing'

type CanchasPageSizeSelectProps = {
  pagination: CanchasPaginationModel
}

export function CanchasPageSizeSelect({ pagination }: CanchasPageSizeSelectProps) {
  return (
    <Select
      onValueChange={(value) => {
        const option = pagination.pageSizeOptions.find(
          (pageSizeOption) => `${pageSizeOption.value}` === value,
        )
        if (option) window.location.href = option.href
      }}
      value={`${pagination.pageSize}`}
    >
      <SelectTrigger aria-label="Filas por pagina" className="w-20" size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent side="top">
        <SelectGroup>
          {pagination.pageSizeOptions.map((option) => (
            <SelectItem key={option.value} value={`${option.value}`}>
              {option.value}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
