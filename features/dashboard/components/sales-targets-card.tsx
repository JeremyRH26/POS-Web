'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Target, Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatNumber } from '@/utils/format'
import type { SalesTarget, SalesTargetPayload } from '@/lib/api'
import { dashboardApi } from '@/lib/api'

interface SalesTargetsCardProps {
  targets: SalesTarget[]
  onRefresh: () => void
}

const TYPE_LABELS: Record<string, string> = {
  sales_amount: 'Monto de Ventas',
  units_sold: 'Unidades Vendidas',
}

const emptyForm: SalesTargetPayload = {
  target_id: null,
  user_id: null,
  route_id: null,
  product_id: null,
  type: 'sales_amount',
  target_amount: 0,
  start_date: new Date().toISOString().split('T')[0],
  end_date: new Date().toISOString().split('T')[0],
}

export function SalesTargetsCard({ targets, onRefresh }: SalesTargetsCardProps) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<SalesTargetPayload>({ ...emptyForm })

  const handleEdit = (t: SalesTarget) => {
    setForm({
      target_id: t.target_id,
      user_id: t.user_id,
      route_id: t.route_id,
      product_id: t.product_id,
      type: t.type,
      target_amount: t.target_amount,
      start_date: t.start_date?.split('T')[0] ?? '',
      end_date: t.end_date?.split('T')[0] ?? '',
    })
    setOpen(true)
  }

  const handleNew = () => {
    setForm({ ...emptyForm })
    setOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await dashboardApi.upsertSalesTarget(form)
      toast.success(form.target_id ? 'Meta actualizada' : 'Meta creada')
      setOpen(false)
      onRefresh()
    } catch {
      toast.error('Error al guardar la meta')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await dashboardApi.deleteSalesTarget(id)
      toast.success('Meta eliminada')
      onRefresh()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Metas de Ventas
          </CardTitle>
          <CardDescription>Objetivos y metas editables</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={handleNew}>
              <Plus className="h-4 w-4 mr-1" /> Nueva Meta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{form.target_id ? 'Editar Meta' : 'Nueva Meta'}</DialogTitle>
              <DialogDescription>Define los parámetros de la meta de ventas</DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel>Tipo</FieldLabel>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales_amount">Monto de Ventas</SelectItem>
                    <SelectItem value="units_sold">Unidades Vendidas</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Meta</FieldLabel>
                <Input
                  type="number"
                  step="0.01"
                  value={form.target_amount}
                  onChange={(e) => setForm({ ...form, target_amount: Number(e.target.value) })}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel>Fecha Inicio</FieldLabel>
                  <Input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel>Fecha Fin</FieldLabel>
                  <Input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel>ID Vendedor (opcional)</FieldLabel>
                <Input
                  type="number"
                  placeholder="Dejar vacío para global"
                  value={form.user_id ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, user_id: e.target.value ? Number(e.target.value) : null })
                  }
                />
              </Field>
              <Button onClick={handleSave} disabled={saving} className="w-full mt-2">
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </FieldGroup>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {targets.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No hay metas configuradas. Crea una nueva meta para comenzar.
          </p>
        ) : (
          <div className="space-y-4">
            {targets.map((t) => {
              const pct = t.target_amount > 0
                ? Math.min(100, (Number(t.current_value) / t.target_amount) * 100)
                : 0
              return (
                <div key={t.target_id} className="p-4 rounded-lg border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{TYPE_LABELS[t.type] ?? t.type}</Badge>
                      {t.user_name && (
                        <span className="text-sm text-muted-foreground">{t.user_name}</span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(t)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(t.target_id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-semibold">
                      {t.type === 'sales_amount'
                        ? formatCurrency(Number(t.current_value))
                        : formatNumber(Number(t.current_value))}
                    </span>
                    <span className="text-muted-foreground">
                      de{' '}
                      {t.type === 'sales_amount'
                        ? formatCurrency(t.target_amount)
                        : formatNumber(t.target_amount)}
                    </span>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {pct.toFixed(1)}% completado &middot; {t.start_date?.split('T')[0]} al{' '}
                    {t.end_date?.split('T')[0]}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
