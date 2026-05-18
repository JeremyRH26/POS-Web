'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Spinner } from '@/components/ui/spinner'
import {
  FileBarChart,
  Calendar,
  ShoppingCart,
  Clock,
  PackageX,
} from 'lucide-react'
import { toast } from 'sonner'
import { reportingApi } from '@/lib/api'
import type {
  SalesByCategoryReport,
  ExpiringProduct,
  LowStockProduct,
} from '@/lib/api'
import { SalesByCategoryPreview } from './sales-by-category-preview'
import { ExpiringProductsPreview } from './expiring-products-preview'
import { LowStockPreview } from './low-stock-preview'

type ReportTab = 'sales-category' | 'expiring' | 'low-stock'

export function ReportsContent() {
  const [activeTab, setActiveTab] = useState<ReportTab>('sales-category')
  const [loading, setLoading] = useState(false)

  // Sales by category
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  })
  const [salesReport, setSalesReport] = useState<SalesByCategoryReport | null>(null)

  // Expiring products
  const [daysAhead, setDaysAhead] = useState(30)
  const [expiringProducts, setExpiringProducts] = useState<ExpiringProduct[] | null>(null)

  // Low stock
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[] | null>(null)

  const handleGenerateSalesCategory = async () => {
    setLoading(true)
    try {
      const data = await reportingApi.salesByCategory(dateRange.start, dateRange.end)
      setSalesReport(data)
      toast.success('Reporte generado exitosamente')
    } catch {
      toast.error('Error al generar el reporte')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateExpiring = async () => {
    setLoading(true)
    try {
      const data = await reportingApi.productsExpiring(daysAhead)
      setExpiringProducts(data)
      toast.success('Reporte generado exitosamente')
    } catch {
      toast.error('Error al generar el reporte')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateLowStock = async () => {
    setLoading(true)
    try {
      const data = await reportingApi.productsLowStock()
      setLowStockProducts(data)
      toast.success('Reporte generado exitosamente')
    } catch {
      toast.error('Error al generar el reporte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Reportes</h1>
        <p className="text-muted-foreground mt-1">
          Genera reportes del sistema con datos en tiempo real
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ReportTab)} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="sales-category">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Ventas por Categoría
          </TabsTrigger>
          <TabsTrigger value="expiring">
            <Clock className="w-4 h-4 mr-2" />
            Próximos a Vencer
          </TabsTrigger>
          <TabsTrigger value="low-stock">
            <PackageX className="w-4 h-4 mr-2" />
            Poca Existencia
          </TabsTrigger>
        </TabsList>

        {/* ---- Ventas por Categoría ---- */}
        <TabsContent value="sales-category">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {loading && !salesReport ? (
                <div className="flex items-center justify-center py-20">
                  <Spinner className="w-8 h-8" />
                </div>
              ) : salesReport ? (
                <SalesByCategoryPreview data={salesReport} dateRange={dateRange} />
              ) : (
                <Card className="border-border/50">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <FileBarChart className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Configura los filtros y genera el reporte
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
            <div>
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Configuración</CardTitle>
                  <CardDescription>Selecciona el rango de fechas</CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="scStart">Fecha Inicio</FieldLabel>
                      <Input
                        id="scStart"
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="scEnd">Fecha Fin</FieldLabel>
                      <Input
                        id="scEnd"
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      />
                    </Field>
                    <Button className="w-full mt-2" onClick={handleGenerateSalesCategory} disabled={loading}>
                      {loading ? 'Generando...' : (
                        <>
                          <FileBarChart className="w-4 h-4 mr-2" />
                          Generar Reporte
                        </>
                      )}
                    </Button>
                  </FieldGroup>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ---- Productos Próximos a Vencer ---- */}
        <TabsContent value="expiring">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {loading && !expiringProducts ? (
                <div className="flex items-center justify-center py-20">
                  <Spinner className="w-8 h-8" />
                </div>
              ) : expiringProducts ? (
                <ExpiringProductsPreview data={expiringProducts} daysAhead={daysAhead} />
              ) : (
                <Card className="border-border/50">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Selecciona los días de anticipación y genera el reporte
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
            <div>
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Configuración</CardTitle>
                  <CardDescription>Días de anticipación para vencimiento</CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="expDays">Días de anticipación</FieldLabel>
                      <Input
                        id="expDays"
                        type="number"
                        min={1}
                        value={daysAhead}
                        onChange={(e) => setDaysAhead(Number(e.target.value))}
                      />
                    </Field>
                    <Button className="w-full mt-2" onClick={handleGenerateExpiring} disabled={loading}>
                      {loading ? 'Generando...' : (
                        <>
                          <Calendar className="w-4 h-4 mr-2" />
                          Generar Reporte
                        </>
                      )}
                    </Button>
                  </FieldGroup>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ---- Productos con Poca Existencia ---- */}
        <TabsContent value="low-stock">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {loading && !lowStockProducts ? (
                <div className="flex items-center justify-center py-20">
                  <Spinner className="w-8 h-8" />
                </div>
              ) : lowStockProducts ? (
                <LowStockPreview data={lowStockProducts} />
              ) : (
                <Card className="border-border/50">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <PackageX className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Genera el reporte para ver productos con poca existencia
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
            <div>
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Configuración</CardTitle>
                  <CardDescription>
                    Muestra productos con stock igual o menor al mínimo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={handleGenerateLowStock} disabled={loading}>
                    {loading ? 'Generando...' : (
                      <>
                        <PackageX className="w-4 h-4 mr-2" />
                        Generar Reporte
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
