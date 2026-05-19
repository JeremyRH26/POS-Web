'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { apiClient, ApiError } from '@/lib/api-client'
import type { Product } from '@/types'
import { MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

function humanizeKey(key: string) {
  const labels: Record<string, string> = {
    product_code: 'Codigo',
    product_name: 'Nombre',
    sale_price: 'Precio Venta',
    cost_price: 'Precio Costo',
    expiration_date: 'Fecha de expiracion',
    category_name: 'Categoria',
    created_at: 'Creacion',
    updated_at: 'Actualizacion',
    stock: 'Existencia',
    min_stock: 'Existencia minima',
    measure_description: 'Descripcion de unidad',
    unit: 'Unidad',
  }

  return labels[key] || key
    
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function normalizeRow(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

/** El API puede devolver un array de filas o una sola fila (compatibilidad). */
function normalizeReaunitRows(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.filter((x) => x && typeof x === 'object' && !Array.isArray(x)) as Record<
      string,
      unknown
    >[]
  }
  const row = normalizeRow(value)
  return row ? [row] : []
}

function stableUnitRowKey(row: Record<string, unknown>, index: number) {
  const candidates = ['id', 'unidad_id', 'unit_id', 'id_unidad', 'product_unit_id', 'codigo']
  for (const k of candidates) {
    const v = row[k]
    if (v !== undefined && v !== null && v !== '') return `${k}:${String(v)}`
  }
  return `idx:${index}`
}

function DataBlock({
  title,
  data,
  emptyLabel,
}: {
  title: string
  data: Record<string, unknown> | null
  emptyLabel: string
}) {

  if (!data) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      </div>
    )
  }

const entries = Object.entries(data).filter(
  ([key, v]) =>
    humanizeKey(key) !== key &&
    v !== null &&
    v !== undefined &&
    v !== ''
)

  if (entries.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <dl className="divide-y divide-border/60 rounded-md border border-border/50 text-sm">
        {entries.map(([key, value]) => (
          <div key={key} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-2 px-3 py-2">
            <dt className="text-muted-foreground">{humanizeKey(key)}</dt>
            <dd className="min-w-0 break-words text-foreground">{formatValue(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function UnitsList({
  rows,
  emptyLabel,
}: {
  rows: Record<string, unknown>[]
  emptyLabel: string
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>
  }

  return (
    <ul className="list-none space-y-3 p-0 m-0">
      {rows.map((row, index) => {
        const entries = Object.entries(row).filter(
          ([, v]) => v !== null && v !== undefined && v !== ''
        )
        return (
          <li
            key={stableUnitRowKey(row, index)}
            className="rounded-lg border border-border/60 bg-muted/10 px-3 py-3 shadow-sm"
          >
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Unidad {index + 1}
            </p>
            {entries.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin campos.</p>
            ) : (
              <dl className="space-y-1.5 text-sm">
                {entries.map(([key, value]) => (
                  <div key={key} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                    <dt className="shrink-0 text-muted-foreground sm:min-w-[7.5rem]">
                      {humanizeKey(key)}
                    </dt>
                    <dd className="min-w-0 flex-1 break-words font-medium text-foreground">
                      {formatValue(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </li>
        )
      })}
    </ul>
  )
}

interface ProductDetailSheetProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  token: string | null
  onEdit?: (product: Product) => void
  onDelete?: (productId: string) => void
}

export function ProductDetailSheet({
  product,
  open,
  onOpenChange,
  token,
  onEdit,
  onDelete,
}: ProductDetailSheetProps) {
  const [loading, setLoading] = useState(false)
  const [productDetail, setProductDetail] = useState<Record<string, unknown> | null>(null)
  const [quantityRows, setQuantityRows] = useState<Record<string, unknown>[]>([])
  const [productError, setProductError] = useState<string | null>(null)
  const [quantityError, setQuantityError] = useState<string | null>(null)
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false)
  const [newUnitDes, setNewUnitDes] = useState('')
  const [newUnitUni, setNewUnitUni] = useState('')
  const [isSavingUnit, setIsSavingUnit] = useState(false)
  const fetchGeneration = useRef(0)

  const productId = product?.id

  const loadDetails = useCallback(async () => {
    if (!productId || !token) return

    const idNum = Number.parseInt(String(productId), 10)
    if (!Number.isFinite(idNum)) {
      setProductError('ID de producto no válido.')
      setQuantityError(null)
      setProductDetail(null)
      setQuantityRows([])
      setLoading(false)
      return
    }

    const gen = ++fetchGeneration.current
    setLoading(true)
    setProductError(null)
    setQuantityError(null)

    const detailPromise = apiClient.get<unknown>(
      `/inventory/products/${encodeURIComponent(String(productId))}`,
      { token }
    )
    const quantityPromise = apiClient.post<unknown>(
      '/inventory/reaunit',
      { id: idNum },
      { token }
    )

    const [detailResult, quantityResult] = await Promise.allSettled([detailPromise, quantityPromise])

    if (gen !== fetchGeneration.current) return

    if (detailResult.status === 'fulfilled') {
      const row = normalizeRow(detailResult.value) ?? { valor: detailResult.value as string }
      setProductDetail(row)
    } else {
      const err = detailResult.reason
      const message =
        err instanceof ApiError ? err.message : 'No se pudo cargar el detalle del producto.'
      setProductError(message)
      setProductDetail(null)
    }

    if (quantityResult.status === 'fulfilled') {
      setQuantityRows(normalizeReaunitRows(quantityResult.value))
    } else {
      const err = quantityResult.reason
      const message =
        err instanceof ApiError ? err.message : 'No se pudo cargar la información de cantidad.'
      setQuantityError(message)
      setQuantityRows([])
    }

    setLoading(false)
  }, [productId, token])

  useEffect(() => {
    if (!open || !productId || !token) {
      fetchGeneration.current += 1
      setProductDetail(null)
      setQuantityRows([])
      setProductError(null)
      setQuantityError(null)
      setLoading(false)
      return
    }

    void loadDetails()
  }, [open, productId, token, loadDetails])

  useEffect(() => {
    if (!open) {
      setIsAddUnitOpen(false)
      setNewUnitDes('')
      setNewUnitUni('')
      setIsSavingUnit(false)
    }
  }, [open])

  const handleSaveNewUnit = async () => {
    if (!token || !productId) {
      toast.error('No hay sesión o producto.')
      return
    }
    const idNum = Number.parseInt(String(productId), 10)
    if (!Number.isFinite(idNum) || !Number.isInteger(idNum)) {
      toast.error('ID de producto no válido.')
      return
    }
    const des = newUnitDes.trim()
    const uniParsed = Number.parseInt(String(newUnitUni).trim(), 10)
    if (!des) {
      toast.error('Indica la descripción o nombre de la unidad (texto).')
      return
    }
    if (!Number.isFinite(uniParsed)) {
      toast.error('Indica un número entero (equivalente en unidades).')
      return
    }
    setIsSavingUnit(true)
    try {
      await apiClient.post('/inventory/unit-sell', { id: idNum, des, uni: uniParsed }, { token })
      toast.success('Unidad de medida registrada.')
      setIsAddUnitOpen(false)
      setNewUnitDes('')
      setNewUnitUni('')
      await loadDetails()
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'No se pudo registrar la unidad.'
      toast.error(message)
    } finally {
      setIsSavingUnit(false)
    }
  }

  const title = product?.name?.trim() ? product.name : 'Detalle del producto'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-lg">
        <SheetHeader className="relative shrink-0 space-y-1 border-b border-border/50 pb-4 pr-14 text-left">
          {product && (onEdit || onDelete) && (
            <div className="absolute right-14 top-3 z-10 sm:right-16">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-9 w-9 rounded-full shadow-md ring-1 ring-border/50"
                    aria-label="Acciones del producto"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {onEdit && (
                    <DropdownMenuItem
                      onClick={() => {
                        onEdit(product)
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                  )}
                  {onEdit && onDelete && <DropdownMenuSeparator />}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(product.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          <SheetTitle className="pr-2 text-lg leading-tight">{title}</SheetTitle>
          {product?.sku && (
            <SheetDescription className="font-mono text-xs">
              SKU: {product.sku}
            </SheetDescription>
          )}
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-6 px-4 py-4">
          {!token && (
            <p className="text-sm text-muted-foreground">Inicia sesión para ver el detalle.</p>
          )}

          {token && loading && (
            <div className="space-y-3">
              <Skeleton className="h-4 w-[75%]" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[83%]" />
              <Skeleton className="h-4 w-[66%]" />
            </div>
          )}

          {token && !loading && productError && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {productError}
            </p>
          )}

          {token && !loading && !productError && (
            <DataBlock title="Información del producto" data={productDetail} emptyLabel="Sin datos." />
          )}

          {token && !loading && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">Unidades de medida</h3>
              {quantityError ? (
                <p className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-foreground">
                  {quantityError}
                </p>
              ) : (
                <UnitsList
                  rows={quantityRows}
                  emptyLabel="No hay unidades registradas para este producto."
                />
              )}
            </div>
          )}

          {token && product && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start"
                disabled={loading || isSavingUnit}
                onClick={() => setIsAddUnitOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Añadir unidad de medida
              </Button>

              <Dialog
                open={isAddUnitOpen}
                onOpenChange={(next) => {
                  setIsAddUnitOpen(next)
                  if (!next) {
                    setNewUnitDes('')
                    setNewUnitUni('')
                  }
                }}
              >
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Nueva unidad de medida</DialogTitle>
                    <DialogDescription>
                      Se enviará al producto actual (ID {product.id}). Descripción en texto y valor
                      numérico entero según requiere el servidor (unitsell).
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="unit-des">Descripción / nombre</Label>
                      <Input
                        id="unit-des"
                        value={newUnitDes}
                        onChange={(e) => setNewUnitDes(e.target.value)}
                        placeholder="Ej: docena"
                        maxLength={250}
                        disabled={isSavingUnit}
                        autoComplete="off"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit-uni">Valor numérico (entero)</Label>
                      <Input
                        id="unit-uni"
                        inputMode="numeric"
                        value={newUnitUni}
                        onChange={(e) => setNewUnitUni(e.target.value)}
                        placeholder="Ej: 12"
                        disabled={isSavingUnit}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddUnitOpen(false)}
                      disabled={isSavingUnit}
                    >
                      Cancelar
                    </Button>
                    <Button type="button" onClick={() => void handleSaveNewUnit()} disabled={isSavingUnit}>
                      {isSavingUnit ? 'Guardando...' : 'Guardar'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
