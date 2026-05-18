'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Printer } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/utils/format'
import { APP_CONFIG } from '@/config'
import type { SalesByCategoryReport } from '@/lib/api'

interface SalesByCategoryPreviewProps {
  data: SalesByCategoryReport
  dateRange: { start: string; end: string }
}

export function SalesByCategoryPreview({ data, dateRange }: SalesByCategoryPreviewProps) {
  const totalOrders = data.summary.reduce((a, b) => a + b.total_orders, 0)
  const totalUnits = data.summary.reduce((a, b) => a + Number(b.total_units), 0)
  const totalNet = data.summary.reduce((a, b) => a + Number(b.net_amount), 0)

  const formatDateRange = () => {
    const start = new Date(dateRange.start).toLocaleDateString('es-GT', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
    const end = new Date(dateRange.end).toLocaleDateString('es-GT', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
    return `${start} - ${end}`
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Reporte de Ventas por Categoría</CardTitle>
            <CardDescription>{formatDateRange()}</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-foreground">{APP_CONFIG.name}</h3>
              <p className="text-sm text-muted-foreground">{APP_CONFIG.description}</p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>Generado: {new Date().toLocaleDateString('es-GT')}</p>
              <p>{new Date().toLocaleTimeString('es-GT')}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-primary/5 rounded-lg">
            <p className="text-sm text-muted-foreground">Total Órdenes</p>
            <p className="text-xl font-bold text-foreground">{formatNumber(totalOrders)}</p>
          </div>
          <div className="p-4 bg-accent/5 rounded-lg">
            <p className="text-sm text-muted-foreground">Unidades Vendidas</p>
            <p className="text-xl font-bold text-foreground">{formatNumber(totalUnits)}</p>
          </div>
          <div className="p-4 bg-chart-3/5 rounded-lg">
            <p className="text-sm text-muted-foreground">Venta Neta</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(totalNet)}</p>
          </div>
        </div>

        {/* Summary by category */}
        <h4 className="font-semibold text-foreground mb-3">Resumen por Categoría</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Órdenes</TableHead>
              <TableHead className="text-right">Unidades</TableHead>
              <TableHead className="text-right">Bruto</TableHead>
              <TableHead className="text-right">Descuento</TableHead>
              <TableHead className="text-right">Neto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.summary.map((row) => (
              <TableRow key={row.category_id}>
                <TableCell className="font-medium">{row.category_name}</TableCell>
                <TableCell className="text-right">{formatNumber(row.total_orders)}</TableCell>
                <TableCell className="text-right">{formatNumber(Number(row.total_units))}</TableCell>
                <TableCell className="text-right">{formatCurrency(Number(row.gross_amount))}</TableCell>
                <TableCell className="text-right">{formatCurrency(Number(row.total_discount))}</TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(Number(row.net_amount))}</TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/30 font-bold">
              <TableCell>Total</TableCell>
              <TableCell className="text-right">{formatNumber(totalOrders)}</TableCell>
              <TableCell className="text-right">{formatNumber(totalUnits)}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(data.summary.reduce((a, b) => a + Number(b.gross_amount), 0))}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(data.summary.reduce((a, b) => a + Number(b.total_discount), 0))}
              </TableCell>
              <TableCell className="text-right">{formatCurrency(totalNet)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {/* Detail by product */}
        {data.details.length > 0 && (
          <>
            <h4 className="font-semibold text-foreground mb-3 mt-8">Detalle por Producto</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Unidades</TableHead>
                  <TableHead className="text-right">P. Unit.</TableHead>
                  <TableHead className="text-right">Neto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.details.map((row) => (
                  <TableRow key={`${row.category_name}-${row.product_id}`}>
                    <TableCell>
                      <Badge variant="secondary">{row.category_name}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.product_code}</TableCell>
                    <TableCell className="font-medium">{row.product_name}</TableCell>
                    <TableCell className="text-right">{formatNumber(Number(row.total_units))}</TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(row.unit_price))}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(Number(row.net_amount))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}

        {data.summary.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No se encontraron ventas en el rango de fechas seleccionado
          </p>
        )}
      </CardContent>
    </Card>
  )
}
