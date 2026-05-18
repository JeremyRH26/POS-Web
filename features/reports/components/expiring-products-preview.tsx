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
import { formatCurrency, formatNumber, formatDate } from '@/utils/format'
import { APP_CONFIG } from '@/config'
import type { ExpiringProduct } from '@/lib/api'

interface ExpiringProductsPreviewProps {
  data: ExpiringProduct[]
  daysAhead: number
}

const URGENCY_STYLES: Record<string, string> = {
  VENCIDO: 'bg-destructive text-destructive-foreground',
  CRITICO: 'bg-destructive/80 text-destructive-foreground',
  URGENTE: 'bg-warning text-warning-foreground',
  PROXIMO: 'bg-accent text-accent-foreground',
}

export function ExpiringProductsPreview({ data, daysAhead }: ExpiringProductsPreviewProps) {
  const totalAtRisk = data.reduce((a, b) => a + Number(b.inventory_value_at_risk), 0)
  const expired = data.filter((d) => d.urgency === 'VENCIDO').length
  const critical = data.filter((d) => d.urgency === 'CRITICO').length

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Productos Próximos a Vencer</CardTitle>
            <CardDescription>
              Productos que vencen en los próximos {daysAhead} días
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
            <p className="text-sm text-muted-foreground">Productos Vencidos</p>
            <p className="text-xl font-bold text-destructive">{expired}</p>
          </div>
          <div className="p-4 bg-warning/10 rounded-lg">
            <p className="text-sm text-muted-foreground">Críticos (&le;7 días)</p>
            <p className="text-xl font-bold text-foreground">{critical}</p>
          </div>
          <div className="p-4 bg-accent/5 rounded-lg">
            <p className="text-sm text-muted-foreground">Valor en Riesgo</p>
            <p className="text-xl font-bold text-foreground">{formatCurrency(totalAtRisk)}</p>
          </div>
        </div>

        {data.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-center">Vencimiento</TableHead>
                <TableHead className="text-center">Días</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Valor Riesgo</TableHead>
                <TableHead className="text-center">Urgencia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.product_id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{row.product_name}</p>
                      <p className="text-xs text-muted-foreground">{row.product_code}</p>
                    </div>
                  </TableCell>
                  <TableCell>{row.category_name}</TableCell>
                  <TableCell className="text-center">{formatDate(row.expiration_date)}</TableCell>
                  <TableCell className="text-center font-semibold">
                    {row.days_until_expiry < 0 ? row.days_until_expiry : `+${row.days_until_expiry}`}
                  </TableCell>
                  <TableCell className="text-right">{formatNumber(row.current_stock)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(Number(row.inventory_value_at_risk))}</TableCell>
                  <TableCell className="text-center">
                    <Badge className={URGENCY_STYLES[row.urgency] ?? ''}>
                      {row.urgency}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No hay productos próximos a vencer en los próximos {daysAhead} días
          </p>
        )}
      </CardContent>
    </Card>
  )
}
