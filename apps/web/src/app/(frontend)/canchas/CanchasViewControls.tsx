'use client'

import { SearchIcon } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { canchaAccessLabels, isCanchaAccessType } from '@/lib/canchas'
import type { CanchasControlsModel } from '@/lib/canchasBrowsing'

import { useCanchasGeo } from './CanchasGeoContext'
import { CanchasLocationFilter } from './CanchasLocationFilter'

type CanchasViewControlsProps = {
  controls: CanchasControlsModel
}

const allValue = '__all__'
const allOptionLabel = 'Cualquiera'

export function CanchasViewControls({ controls }: CanchasViewControlsProps) {
  const { filterOptions, view } = controls
  const { hasGeoFilter, setUserGeo } = useCanchasGeo()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const searchTimeout = React.useRef<number>(null)

  const updateParams = React.useCallback(
    (updates: Record<string, null | string>) => {
      const params = new URLSearchParams(searchParams.toString())

      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      }

      const nextQuery = params.toString()
      router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname)
    },
    [pathname, router, searchParams],
  )

  React.useEffect(
    () => () => {
      if (searchTimeout.current) window.clearTimeout(searchTimeout.current)
    },
    [],
  )

  const updateSearch = (value: string) => {
    if (searchTimeout.current) window.clearTimeout(searchTimeout.current)

    searchTimeout.current = window.setTimeout(() => {
      if (value === query) return

      updateParams({
        page: null,
        q: value.trim() || null,
      })
    }, 300)
  }

  const updateFilter = (key: 'accessType' | 'city' | 'region', value: string) => {
    updateParams({
      [key]: value === allValue ? null : value,
      page: null,
    })
  }

  const hasFilters =
    Boolean(query) ||
    Boolean(searchParams.get('accessType')) ||
    Boolean(searchParams.get('region')) ||
    Boolean(searchParams.get('city')) ||
    hasGeoFilter

  return (
    <div className="mt-6 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToggleGroup
          aria-label="Vista de canchas"
          onValueChange={(value) => {
            const nextView = value[0]
            if (!nextView) return

            updateParams({
              page: null,
              view: nextView === 'table' ? 'table' : null,
            })
          }}
          value={[view]}
          variant="outline"
        >
          <ToggleGroupItem value="cards">Mapa</ToggleGroupItem>
          <ToggleGroupItem value="table">Tabla</ToggleGroupItem>
        </ToggleGroup>
        {hasFilters ? (
          <Button
            onClick={() => {
              setUserGeo(null)
              updateParams({
                accessType: null,
                city: null,
                page: null,
                q: null,
                region: null,
              })
            }}
            type="button"
            variant="outline"
          >
            Limpiar filtros
          </Button>
        ) : null}
      </div>
      <CanchasLocationFilter />
      <div className="grid grid-cols-canchas-filters gap-2 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs font-normal text-muted-foreground" htmlFor="canchas-search">
            Buscar cancha
          </Label>
          <div className="relative">
            <SearchIcon
              aria-hidden="true"
              className="pointer-events-none absolute inset-s-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              data-icon="inline-start"
            />
            <Input
              className="ps-8"
              defaultValue={query}
              id="canchas-search"
              key={query}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Nombre o dirección"
            />
          </div>
        </div>
        <FilterSelect
          id="canchas-filter-access-type"
          label="Tipo de acceso"
          onValueChange={(value) => updateFilter('accessType', value)}
          options={filterOptions.accessTypes.map((accessType) => ({
            label: isCanchaAccessType(accessType) ? canchaAccessLabels[accessType] : accessType,
            value: accessType,
          }))}
          value={searchParams.get('accessType') ?? allValue}
        />
        <FilterSelect
          id="canchas-filter-region"
          label="Región"
          onValueChange={(value) => updateFilter('region', value)}
          options={filterOptions.regions.map((region) => ({ label: region, value: region }))}
          value={searchParams.get('region') ?? allValue}
        />
        <FilterSelect
          id="canchas-filter-city"
          label="Ciudad"
          onValueChange={(value) => updateFilter('city', value)}
          options={filterOptions.cities.map((city) => ({ label: city, value: city }))}
          value={searchParams.get('city') ?? allValue}
        />
      </div>
    </div>
  )
}

function FilterSelect({
  id,
  label,
  onValueChange,
  options,
  value,
}: {
  id: string
  label: string
  onValueChange: (value: string) => void
  options: { label: string; value: string }[]
  value: string
}) {
  const items = [{ label: allOptionLabel, value: allValue }, ...options]

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-normal text-muted-foreground" htmlFor={id}>
        {label}
      </Label>
      <Select
        items={items}
        onValueChange={(nextValue) => {
          if (nextValue == null) return
          onValueChange(nextValue)
        }}
        value={value}
      >
        <SelectTrigger className="w-full" id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
