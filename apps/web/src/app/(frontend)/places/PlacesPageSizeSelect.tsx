'use client'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { PlacesPaginationModel } from '@/lib/placesBrowsing'

export type PlacesPageSizeSelectProps = {
  pagination: PlacesPaginationModel
}

export function PlacesPageSizeSelect({ pagination }: PlacesPageSizeSelectProps) {
  const items = pagination.pageSizeOptions.map((option) => ({
    label: `${option.value}`,
    value: `${option.value}`,
  }))

  return (
    <Select
      items={items}
      onValueChange={(value) => {
        if (value == null) return

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
      <SelectContent alignItemWithTrigger={false} side="top">
        <SelectGroup>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
