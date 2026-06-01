"use client"

import {
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Columns3Icon,
  ExternalLinkIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { canchaAccessLabels, getGoogleMapsUrl, type CanchaMapItem } from "@/lib/canchas"

type CanchasDataTableProps = {
  canchas: CanchaMapItem[]
  page: number
  pageSize: number
  sort: CanchasSort
  totalDocs: number
  totalPages: number
}

export type CanchasSort = {
  direction: "asc" | "desc"
  field: "accessType" | "city" | "region" | "title"
}

const columnLabels: Record<string, string> = {
  accessType: "Acceso",
  actions: "Acciones",
  city: "Ciudad",
  region: "Region",
  summary: "Resumen",
  title: "Cancha",
}

export function CanchasDataTable({
  canchas,
  page,
  pageSize,
  sort,
  totalDocs,
  totalPages,
}: CanchasDataTableProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  const updateParams = React.useCallback(
    (updates: Record<string, null | string>) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("view", "table")

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

  const columns = React.useMemo<ColumnDef<CanchaMapItem>[]>(
    () => [
      {
        accessorKey: "title",
        cell: ({ row }) => (
          <Button asChild className="h-auto justify-start px-0 py-0 text-left" variant="link">
            <Link href={`/canchas/${row.original.slug}`}>{row.original.title}</Link>
          </Button>
        ),
        header: ({ column }) => (
          <SortButton
            active={sort.field === "title"}
            direction={sort.direction}
            label="Cancha"
            onClick={() => column.toggleSorting(sort.field === "title" && sort.direction === "asc")}
          />
        ),
      },
      {
        accessorKey: "accessType",
        cell: ({ row }) => (
          <Badge variant="outline">{canchaAccessLabels[row.original.accessType]}</Badge>
        ),
        header: ({ column }) => (
          <SortButton
            active={sort.field === "accessType"}
            direction={sort.direction}
            label="Acceso"
            onClick={() =>
              column.toggleSorting(sort.field === "accessType" && sort.direction === "asc")
            }
          />
        ),
      },
      {
        accessorKey: "region",
        cell: ({ row }) => row.original.region || "Sin region",
        header: ({ column }) => (
          <SortButton
            active={sort.field === "region"}
            direction={sort.direction}
            label="Region"
            onClick={() =>
              column.toggleSorting(sort.field === "region" && sort.direction === "asc")
            }
          />
        ),
      },
      {
        accessorKey: "city",
        cell: ({ row }) => row.original.city || "Sin ciudad",
        header: ({ column }) => (
          <SortButton
            active={sort.field === "city"}
            direction={sort.direction}
            label="Ciudad"
            onClick={() => column.toggleSorting(sort.field === "city" && sort.direction === "asc")}
          />
        ),
      },
      {
        accessorKey: "summary",
        cell: ({ row }) => (
          <span className="block max-w-[420px] truncate text-muted-foreground">
            {row.original.summary || "Sin resumen"}
          </span>
        ),
        enableSorting: false,
        header: "Resumen",
      },
      {
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button asChild size="sm" variant="outline">
              <Link href={`/canchas/${row.original.slug}`}>Ver ficha</Link>
            </Button>
            <Button asChild size="icon-sm" variant="outline">
              <a href={getGoogleMapsUrl(row.original)} rel="noreferrer" target="_blank">
                <ExternalLinkIcon />
                <span className="sr-only">Google Maps</span>
              </a>
            </Button>
          </div>
        ),
        enableHiding: false,
        id: "actions",
        header: () => <span className="sr-only">Acciones</span>,
      },
    ],
    [sort.direction, sort.field],
  )

  const sorting = React.useMemo<SortingState>(
    () => [{ desc: sort.direction === "desc", id: sort.field }],
    [sort],
  )

  const table = useReactTable({
    columns,
    data: canchas,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: (updater) => {
      const nextSorting = typeof updater === "function" ? updater(sorting) : updater
      const nextSort = nextSorting[0]

      if (!nextSort) {
        updateParams({ page: null, sort: null })
        return
      }

      updateParams({
        page: null,
        sort: `${nextSort.desc ? "-" : ""}${nextSort.id}`,
      })
    },
    pageCount: totalPages,
    state: {
      columnVisibility,
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
      sorting,
    },
  })

  const firstRow = totalDocs === 0 ? 0 : (page - 1) * pageSize + 1
  const lastRow = Math.min(page * pageSize, totalDocs)

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {firstRow}-{lastRow} de {totalDocs} canchas
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline">
              <Columns3Icon data-icon="inline-start" />
              Columnas
              <ChevronDownIcon data-icon="inline-end" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  checked={column.getIsVisible()}
                  key={column.id}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {columnLabels[column.id] ?? column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="h-24 text-center text-muted-foreground" colSpan={columns.length}>
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
          <Select
            onValueChange={(value) =>
              updateParams({
                page: null,
                pageSize: value,
              })
            }
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
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium">
            Pagina {page} de {Math.max(totalPages, 1)}
          </div>
          <div className="flex items-center gap-1">
            <Button
              disabled={page <= 1}
              onClick={() => updateParams({ page: "1" })}
              size="icon-sm"
              type="button"
              variant="outline"
            >
              <ChevronsLeftIcon />
              <span className="sr-only">Primera pagina</span>
            </Button>
            <Button
              disabled={page <= 1}
              onClick={() => updateParams({ page: `${page - 1}` })}
              size="icon-sm"
              type="button"
              variant="outline"
            >
              <ChevronLeftIcon />
              <span className="sr-only">Pagina anterior</span>
            </Button>
            <Button
              disabled={page >= totalPages}
              onClick={() => updateParams({ page: `${page + 1}` })}
              size="icon-sm"
              type="button"
              variant="outline"
            >
              <ChevronRightIcon />
              <span className="sr-only">Pagina siguiente</span>
            </Button>
            <Button
              disabled={page >= totalPages}
              onClick={() => updateParams({ page: `${totalPages}` })}
              size="icon-sm"
              type="button"
              variant="outline"
            >
              <ChevronsRightIcon />
              <span className="sr-only">Ultima pagina</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SortButton({
  active,
  direction,
  label,
  onClick,
}: {
  active: boolean
  direction: "asc" | "desc"
  label: string
  onClick: () => void
}) {
  return (
    <Button className="px-0" onClick={onClick} size="sm" type="button" variant="ghost">
      {label}
      <ChevronDownIcon
        className={active && direction === "asc" ? "rotate-180" : undefined}
        data-icon="inline-end"
      />
    </Button>
  )
}
