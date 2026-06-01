'use client'

import { usePathname, useRouter } from 'next/navigation'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type CanchasPageSizeSelectProps = {
  pageSize: number
  searchParams: Record<string, string | string[] | undefined>
}

export function CanchasPageSizeSelect({ pageSize, searchParams }: CanchasPageSizeSelectProps) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <Select
      onValueChange={(value) => {
        const params = new URLSearchParams()

        for (const [key, paramValue] of Object.entries(searchParams)) {
          const value = Array.isArray(paramValue) ? paramValue[0] : paramValue
          if (value) params.set(key, value)
        }

        params.set('view', 'table')
        params.set('pageSize', value)
        params.delete('page')

        router.push(`${pathname}?${params.toString()}`)
      }}
      value={`${pageSize}`}
    >
      <SelectTrigger aria-label="Filas por pagina" className="w-20" size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent side="top">
        <SelectGroup>
          {[10, 20, 50].map((size) => (
            <SelectItem key={size} value={`${size}`}>
              {size}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
