'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileBarChart,
  FileSpreadsheet,
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Package,
  Users,
  ShoppingCart,
} from 'lucide-react'
import { toast } from 'sonner'
import type { ReportType } from '@/types'
import { ReportPreview } from './report-preview'

const reportTypes: {
  id: ReportType
  name: string
  description: string
  icon: typeof FileBarChart
}[] = [
  {
    id: 'sales',
    name: 'Reporte de Ventas',
    description: 'Resumen de ventas por período, cliente y producto',
    icon: TrendingUp,
  },
  {
    id: 'inventory',
    name: 'Reporte de Inventario',
    description: 'Estado actual del inventario y movimientos',
    icon: Package,
  },
  {
    id: 'clients',
    name: 'Reporte de Clientes',
    description: 'Listado de clientes, saldos y créditos',
    icon: Users,
  },
  {
    id: 'products',
    name: 'Reporte de Productos',
    description: 'Catálogo de productos con precios y stock',
    icon: ShoppingCart,
  },
]

const recentReports = [
  {
    id: '1',
    name: 'Ventas Febrero 2024',
    type: 'sales' as ReportType,
    format: 'pdf',
    date: new Date('2024-03-01'),
  },
  {
    id: '2',
    name: 'Inventario Marzo 2024',
    type: 'inventory' as ReportType,
    format: 'excel',
    date: new Date('2024-03-05'),
  },
  {
    id: '3',
    name: 'Clientes Activos',
    type: 'clients' as ReportType,
    format: 'pdf',
    date: new Date('2024-03-03'),
  },
]

export function ReportsContent() {
  const [selectedType, setSelectedType] = useState<ReportType>('sales')
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  })
  const [format, setFormat] = useState<'pdf' | 'excel'>('pdf')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)
    // Simulate report generation
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsGenerating(false)
    setShowPreview(true)
    toast.success(`Reporte generado exitosamente`)
  }

  const handleDownload = (reportFormat: 'pdf' | 'excel') => {
    toast.success(`Descargando reporte en formato ${reportFormat.toUpperCase()}`)
    // In a real app, this would trigger a file download
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Reportes</h1>
        <p className="text-muted-foreground mt-1">
          Genera y descarga reportes del sistema
        </p>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="generate">
            <FileBarChart className="w-4 h-4 mr-2" />
            Generar Reporte
          </TabsTrigger>
          <TabsTrigger value="history">
            <Calendar className="w-4 h-4 mr-2" />
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Report Selection */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Tipo de Reporte</CardTitle>
                  <CardDescription>
                    Selecciona el tipo de reporte que deseas generar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {reportTypes.map((report) => (
                      <button
                        key={report.id}
                        type="button"
                        onClick={() => setSelectedType(report.id)}
                        className={`flex items-start gap-4 p-4 rounded-lg border text-left transition-colors ${
                          selectedType === report.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            selectedType === report.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <report.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {report.name}
                          </p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {report.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              {showPreview && (
                <ReportPreview
                  type={selectedType}
                  dateRange={dateRange}
                  onDownload={handleDownload}
                />
              )}
            </div>

            {/* Configuration */}
            <div className="space-y-4">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Configuración</CardTitle>
                  <CardDescription>
                    Define los parámetros del reporte
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="startDate">Fecha Inicio</FieldLabel>
                      <Input
                        id="startDate"
                        type="date"
                        value={dateRange.start}
                        onChange={(e) =>
                          setDateRange({ ...dateRange, start: e.target.value })
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="endDate">Fecha Fin</FieldLabel>
                      <Input
                        id="endDate"
                        type="date"
                        value={dateRange.end}
                        onChange={(e) =>
                          setDateRange({ ...dateRange, end: e.target.value })
                        }
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Formato de Salida</FieldLabel>
                      <Select
                        value={format}
                        onValueChange={(v) => setFormat(v as 'pdf' | 'excel')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">
                            <div className="flex items-center">
                              <FileText className="w-4 h-4 mr-2 text-destructive" />
                              PDF
                            </div>
                          </SelectItem>
                          <SelectItem value="excel">
                            <div className="flex items-center">
                              <FileSpreadsheet className="w-4 h-4 mr-2 text-accent" />
                              Excel
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Button
                      className="w-full mt-2"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        'Generando...'
                      ) : (
                        <>
                          <FileBarChart className="w-4 h-4 mr-2" />
                          Generar Reporte
                        </>
                      )}
                    </Button>
                  </FieldGroup>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedType('sales')
                      const today = new Date()
                      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
                      setDateRange({
                        start: firstDay.toISOString().split('T')[0],
                        end: today.toISOString().split('T')[0],
                      })
                    }}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Ventas del Mes
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedType('inventory')
                      const today = new Date()
                      setDateRange({
                        start: today.toISOString().split('T')[0],
                        end: today.toISOString().split('T')[0],
                      })
                    }}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Stock Actual
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Reportes Recientes</CardTitle>
              <CardDescription>
                Historial de reportes generados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentReports.map((report) => {
                  const reportType = reportTypes.find((r) => r.id === report.type)
                  const Icon = reportType?.icon || FileBarChart

                  return (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-muted">
                          <Icon className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {report.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {report.date.toLocaleDateString('es-GT')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">
                          {report.format.toUpperCase()}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(report.format as 'pdf' | 'excel')}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
