"use client"

import { SearchIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { canchaAccessLabels } from "@/lib/canchas"

type CanchasViewControlsProps = {
  accessTypes: string[]
  cities: string[]
  regions: string[]
  view: "cards" | "table"
}

const allValue = "__all__"

export function CanchasViewControls({
  accessTypes,
  cities,
  regions,
  view,
}: CanchasViewControlsProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get("q") ?? ""
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

  React.useEffect(() => () => {
    if (searchTimeout.current) window.clearTimeout(searchTimeout.current)
  }, [])

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

  const updateFilter = (key: "accessType" | "city" | "region", value: string) => {
    updateParams({
      [key]: value === allValue ? null : value,
      page: null,
    })
  }

  const hasFilters =
    Boolean(query) ||
    Boolean(searchParams.get("accessType")) ||
    Boolean(searchParams.get("region")) ||
    Boolean(searchParams.get("city"))

  return (
    <div className="mt-6 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToggleGroup
          aria-label="Vista de canchas"
          onValueChange={(value) => {
            if (!value) return

            updateParams({
              page: null,
              view: value === "table" ? "table" : null,
            })
          }}
          type="single"
          value={view}
          variant="outline"
        >
          <ToggleGroupItem value="cards">Mapa</ToggleGroupItem>
          <ToggleGroupItem value="table">Tabla</ToggleGroupItem>
        </ToggleGroup>
        {hasFilters ? (
          <Button
            onClick={() =>
              updateParams({
                accessType: null,
                city: null,
                page: null,
                q: null,
                region: null,
              })
            }
            type="button"
            variant="outline"
          >
            Limpiar filtros
          </Button>
        ) : null}
      </div>
      <div className="grid grid-cols-[minmax(220px,1.4fr)_repeat(3,minmax(160px,1fr))] gap-2 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
        <label className="relative block">
          <span className="sr-only">Buscar cancha</span>
          <SearchIcon
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            data-icon="inline-start"
          />
          <Input
            className="pl-8"
            defaultValue={query}
            key={query}
            onChange={(event) => updateSearch(event.target.value)}
            placeholder="Buscar cancha"
          />
        </label>
        <FilterSelect
          label="Tipo de acceso"
          onValueChange={(value) => updateFilter("accessType", value)}
          options={accessTypes.map((accessType) => ({
            label: canchaAccessLabels[accessType as keyof typeof canchaAccessLabels] ?? accessType,
            value: accessType,
          }))}
          value={searchParams.get("accessType") ?? allValue}
        />
        <FilterSelect
          label="Region"
          onValueChange={(value) => updateFilter("region", value)}
          options={regions.map((region) => ({ label: region, value: region }))}
          value={searchParams.get("region") ?? allValue}
        />
        <FilterSelect
          label="Ciudad"
          onValueChange={(value) => updateFilter("city", value)}
          options={cities.map((city) => ({ label: city, value: city }))}
          value={searchParams.get("city") ?? allValue}
        />
      </div>
    </div>
  )
}

function FilterSelect({
  label,
  onValueChange,
  options,
  value,
}: {
  label: string
  onValueChange: (value: string) => void
  options: { label: string; value: string }[]
  value: string
}) {
  return (
    <Select onValueChange={onValueChange} value={value}>
      <SelectTrigger aria-label={label} className="w-full">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value={allValue}>{label}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
