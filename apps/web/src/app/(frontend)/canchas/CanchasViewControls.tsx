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

export type CanchasViewControlsProps = {
  controls: CanchasControlsModel
}

const allValue = '__all__'
const allOptionLabel = 'Cualquiera'

/** Applies key/value updates to a URLSearchParams copy; null deletes the key. */
function applyParamUpdates(params: URLSearchParams, updates: Record<string, null | string>) {
  for (const [key, value] of Object.entries(updates)) {
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
  }
}

const formatParamsHref = (pathname: string, params: URLSearchParams) => {
  const nextQuery = params.toString()

  return nextQuery ? `${pathname}?${nextQuery}` : pathname
}

const filterUpdates = (key: 'accessType' | 'city' | 'region', value: string) => ({
  [key]: value === allValue ? null : value,
  page: null,
})

const filterValue = (searchParams: URLSearchParams, key: string) =>
  searchParams.get(key) ?? allValue

const updateView = (
  updateParams: (updates: Record<string, null | string>) => void,
  value: string[],
) => {
  const nextView = value[0]
  if (!nextView) return

  updateParams({
    page: null,
    view: nextView === 'table' ? 'table' : null,
  })
}

/** Debounced search input handler: skips no-op values and cleans up on unmount. */
function useDebouncedSearch(
  query: string,
  updateParams: (updates: Record<string, null | string>) => void,
) {
  const searchTimeout = React.useRef<number>(null)

  React.useEffect(
    () => () => {
      if (searchTimeout.current) window.clearTimeout(searchTimeout.current)
    },
    [],
  )

  return (value: string) => {
    if (searchTimeout.current) window.clearTimeout(searchTimeout.current)

    searchTimeout.current = window.setTimeout(() => {
      if (value === query) return

      updateParams({
        page: null,
        q: value.trim() || null,
      })
    }, 300)
  }
}

function hasActiveFilters(
  query: string,
  searchParams: URLSearchParams,
  hasGeoFilter: boolean,
): boolean {
  return (
    [
      query,
      searchParams.get('accessType'),
      searchParams.get('region'),
      searchParams.get('city'),
    ].some(Boolean) || hasGeoFilter
  )
}

export function CanchasViewControls({ controls }: CanchasViewControlsProps) {
  const { filterOptions, view } = controls
  const { hasGeoFilter, setUserGeo } = useCanchasGeo()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') ?? ''

  // React Compiler caches this callback automatically.
  const updateParams = (updates: Record<string, null | string>) => {
    const params = new URLSearchParams(searchParams.toString())

    applyParamUpdates(params, updates)
    router.push(formatParamsHref(pathname, params))
  }

  const updateSearch = useDebouncedSearch(query, updateParams)

  const updateFilter = (key: 'accessType' | 'city' | 'region', value: string) => {
    updateParams(filterUpdates(key, value))
  }

  const clearFilters = () => {
    setUserGeo(null)
    updateParams({
      accessType: null,
      city: null,
      page: null,
      q: null,
      region: null,
    })
  }

  const filtersActive = hasActiveFilters(query, searchParams, hasGeoFilter)

  return (
    <div className="mt-6 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToggleGroup
          aria-label="Vista de canchas"
          onValueChange={(value) => updateView(updateParams, value)}
          value={[view]}
          variant="outline"
        >
          <ToggleGroupItem value="cards">Mapa</ToggleGroupItem>
          <ToggleGroupItem value="table">Tabla</ToggleGroupItem>
        </ToggleGroup>
        {filtersActive ? (
          <Button onClick={clearFilters} type="button" variant="outline">
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
          value={filterValue(searchParams, 'accessType')}
        />
        <FilterSelect
          id="canchas-filter-region"
          label="Región"
          onValueChange={(value) => updateFilter('region', value)}
          options={filterOptions.regions.map((region) => ({ label: region, value: region }))}
          value={filterValue(searchParams, 'region')}
        />
        <FilterSelect
          id="canchas-filter-city"
          label="Ciudad"
          onValueChange={(value) => updateFilter('city', value)}
          options={filterOptions.cities.map((city) => ({ label: city, value: city }))}
          value={filterValue(searchParams, 'city')}
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
