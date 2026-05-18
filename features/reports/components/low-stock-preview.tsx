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
import type { LowStockProduct } from '@/lib/api'

interface LowStockPreviewProps {
  data: LowStockProduct[]
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  SIN_STOCK: { label: 'Sin Stock', className: 'bg-destructive text-destructive-foreground' },
  BAJO: { label: 'Stock Bajo', className: 'border-warning text-warning-foreground' },
}

export function LowStockPreview({ data }: LowStockPreviewProps) {
  const outOfStock = data.filter((d) => d.stock_status === 'SIN_STOCK').length
  const lowStock = data.filter((d) => d.stock_status === 'BAJO').length
  const totalRestockCost = data.reduce((a, b) => a + Math.max(0, Number(b.restock_cost)), 0)

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Productos con Poca Existencia</CardTitle>
            <CardDescription>
              Productos con stock igual o menor al mínimo configurado
            </CardDescription>
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
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-destructive/5 rounded-lg">
            <p className="text-sm text-muted-foreground">Sin Stock</p>
            <p className="text-xl font-bold text-destructive">{outOfStock}</p>
          </div>
          <div className="p-4 bg-warning/10 rounded-lg">
            <p className="text-sm text-muted-foreground">Stock Bajo</p>
            <p className="text-xl font-bold text-foreground">{lowStock}</p>
          </div>
          <div className="p-4 bg-accent/5 rounded-lg">
            <p className="text-sm text-muted-foreground">Costo Reabastecimiento</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(totalRestockCost)}</p>
          </div>
        </div>

        {data.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Stock Actual</TableHead>
                <TableHead className="text-right">Stock Mínimo</TableHead>
                <TableHead className="text-right">Unidades Necesarias</TableHead>
                <TableHead className="text-right">Costo Reabast.</TableHead>
                <TableHead className="text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => {
                const style = STATUS_STYLES[row.stock_status]
                return (
                  <TableRow key={row.product_id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{row.product_name}</p>
                        <p className="text-xs text-muted-foreground">{row.product_code}</p>
                      </div>
                    </TableCell>
                    <TableCell>{row.category_name}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatNumber(row.current_stock)}
                    </TableCell>
                    <TableCell className="text-right">{formatNumber(row.min_stock)}</TableCell>
                    <TableCell className="text-right">
                      {Math.max(0, row.units_needed) > 0 ? formatNumber(Math.max(0, row.units_needed)) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {Number(row.restock_cost) > 0 ? formatCurrency(Number(row.restock_cost)) : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={row.stock_status === 'SIN_STOCK' ? 'default' : 'outline'}
                        className={style?.className ?? ''}
                      >
                        {style?.label ?? row.stock_status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Todos los productos tienen stock suficiente
          </p>
        )}
      </CardContent>
    </Card>
  )
}
