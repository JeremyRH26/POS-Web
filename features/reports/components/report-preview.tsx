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
import { Download, FileSpreadsheet, FileText, Printer } from 'lucide-react'
import type { ReportType } from '@/types'
import { formatCurrency, formatNumber } from '@/utils/format'
import { APP_CONFIG } from '@/config'

interface ReportPreviewProps {
  type: ReportType
  dateRange: { start: string; end: string }
  onDownload: (format: 'pdf' | 'excel') => void
}

// Mock data for preview
const salesData = [
  { product: 'Coca-Cola 600ml', quantity: 450, revenue: 3825.00 },
  { product: 'Cerveza Gallo 355ml', quantity: 320, revenue: 3200.00 },
  { product: 'Agua Salvavidas 1L', quantity: 280, revenue: 1400.00 },
  { product: 'Leche Foremost 1L', quantity: 150, revenue: 2175.00 },
  { product: 'Doritos Nacho 145g', quantity: 95, revenue: 1140.00 },
]

const inventoryData = [
  { product: 'Coca-Cola 600ml', stock: 150, minStock: 50, status: 'ok' },
  { product: 'Doritos Nacho 145g', stock: 25, minStock: 30, status: 'low' },
  { product: 'Arroz Supremo 5lb', stock: 15, minStock: 20, status: 'low' },
  { product: 'Cerveza Gallo 355ml', stock: 300, minStock: 100, status: 'ok' },
  { product: 'Leche Foremost 1L', stock: 80, minStock: 40, status: 'ok' },
]

const clientsData = [
  { name: 'Tienda Don José', balance: 2500, creditLimit: 10000, usage: 25 },
  { name: 'Distribuidora El Sol', balance: 15000, creditLimit: 50000, usage: 30 },
  { name: 'Mini Super Express', balance: 8500, creditLimit: 25000, usage: 34 },
  { name: 'Super Mercado Central', balance: 5600, creditLimit: 35000, usage: 16 },
]

export function ReportPreview({ type, dateRange, onDownload }: ReportPreviewProps) {
  const reportTitles: Record<ReportType, string> = {
    sales: 'Reporte de Ventas',
    inventory: 'Reporte de Inventario',
    clients: 'Reporte de Clientes',
    products: 'Reporte de Productos',
  }

  const formatDateRange = () => {
    const start = new Date(dateRange.start).toLocaleDateString('es-GT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    const end = new Date(dateRange.end).toLocaleDateString('es-GT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    return `${start} - ${end}`
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{reportTitles[type]}</CardTitle>
            <CardDescription>{formatDateRange()}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onDownload('excel')}>
              <FileSpreadsheet className="w-4 h-4 mr-2 text-accent" />
              Excel
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDownload('pdf')}>
              <FileText className="w-4 h-4 mr-2 text-destructive" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Report Header */}
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

        {/* Sales Report */}
        {type === 'sales' && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-primary/5 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Ventas</p>
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(11740)}
                </p>
              </div>
              <div className="p-4 bg-accent/5 rounded-lg">
                <p className="text-sm text-muted-foreground">Unidades Vendidas</p>
                <p className="text-xl font-bold text-foreground">
                  {formatNumber(1295)}
                </p>
              </div>
              <div className="p-4 bg-chart-3/5 rounded-lg">
                <p className="text-sm text-muted-foreground">Productos</p>
                <p className="text-xl font-bold text-foreground">5</p>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Ingresos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesData.map((row) => (
                  <TableRow key={row.product}>
                    <TableCell className="font-medium">{row.product}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.quantity)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.revenue)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/30 font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">
                    {formatNumber(salesData.reduce((a, b) => a + b.quantity, 0))}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(salesData.reduce((a, b) => a + b.revenue, 0))}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </>
        )}

        {/* Inventory Report */}
        {type === 'inventory' && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-primary/5 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Productos</p>
                <p className="text-xl font-bold text-foreground">5</p>
              </div>
              <div className="p-4 bg-accent/5 rounded-lg">
                <p className="text-sm text-muted-foreground">Stock Total</p>
                <p className="text-xl font-bold text-foreground">
                  {formatNumber(570)}
                </p>
              </div>
              <div className="p-4 bg-warning/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Stock Bajo</p>
                <p className="text-xl font-bold text-warning-foreground">2</p>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Stock Actual</TableHead>
                  <TableHead className="text-right">Stock Mínimo</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryData.map((row) => (
                  <TableRow key={row.product}>
                    <TableCell className="font-medium">{row.product}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.stock)}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.minStock)}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={row.status === 'ok' ? 'secondary' : 'outline'}
                        className={row.status === 'low' ? 'border-warning text-warning-foreground' : ''}
                      >
                        {row.status === 'ok' ? 'OK' : 'Bajo'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}

        {/* Clients Report */}
        {type === 'clients' && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-primary/5 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Clientes</p>
                <p className="text-xl font-bold text-foreground">4</p>
              </div>
              <div className="p-4 bg-accent/5 rounded-lg">
                <p className="text-sm text-muted-foreground">Crédito Disponible</p>
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(120000)}
                </p>
              </div>
              <div className="p-4 bg-warning/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Saldo Pendiente</p>
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(31600)}
                </p>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead className="text-right">Límite</TableHead>
                  <TableHead className="text-center">Uso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientsData.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.balance)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.creditLimit)}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className={row.usage > 50 ? 'bg-warning/10 text-warning-foreground' : ''}
                      >
                        {row.usage}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}

        {/* Products Report */}
        {type === 'products' && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-primary/5 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Productos</p>
                <p className="text-xl font-bold text-foreground">5</p>
              </div>
              <div className="p-4 bg-accent/5 rounded-lg">
                <p className="text-sm text-muted-foreground">Con Descuento</p>
                <p className="text-xl font-bold text-foreground">2</p>
              </div>
              <div className="p-4 bg-chart-3/5 rounded-lg">
                <p className="text-sm text-muted-foreground">Valor Inventario</p>
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(45000)}
                </p>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesData.map((row) => (
                  <TableRow key={row.product}>
                    <TableCell className="font-medium">{row.product}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.quantity)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.revenue / row.quantity)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  )
}
