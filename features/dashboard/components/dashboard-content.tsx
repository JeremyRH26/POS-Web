'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { formatCurrency, formatNumber } from '@/utils/format'
import { useAuthStore } from '@/stores/auth-store'
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  XCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { SalesChart } from './sales-chart'
import { TopProductsChart } from './top-products-chart'
import { SalesTargetsCard } from './sales-targets-card'
import { RejectionsCard } from './rejections-card'
import { SellersCard } from './sellers-card'
import {
  dashboardApi,
  type DashboardSummary,
  type SalesTarget,
  type RejectionMetric,
  type SellerSales,
  type SellerRejections,
} from '@/lib/api'
import { toast } from 'sonner'

export function DashboardContent() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [targets, setTargets] = useState<SalesTarget[]>([])
  const [rejections, setRejections] = useState<RejectionMetric[]>([])
  const [sellerSales, setSellerSales] = useState<SellerSales[]>([])
  const [sellerRejections, setSellerRejections] = useState<SellerRejections[]>([])

  const fetchAll = useCallback(async () => {
    try {
      const [summaryData, targetsData, rejectionsData, salesData, rejData] =
        await Promise.all([
          dashboardApi.getSummary(),
          dashboardApi.getSalesTargets(),
          dashboardApi.getRejectionMetrics(),
          dashboardApi.getSalesBySeller(),
          dashboardApi.getRejectionsBySeller(),
        ])
      setSummary(summaryData)
      setTargets(targetsData)
      setRejections(rejectionsData)
      setSellerSales(salesData)
      setSellerRejections(rejData)
    } catch {
      toast.error('Error al cargar los datos del dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const refreshTargets = async () => {
    try {
      const data = await dashboardApi.getSalesTargets()
      setTargets(data)
    } catch {
      toast.error('Error al recargar metas')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="w-8 h-8" />
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  const kpis = summary?.kpis
  const salesByMonth = (summary?.salesByMonth ?? []).map((s) => ({
    month: s.month_label,
    sales: Number(s.total_sales),
  }))
  const topProducts = (summary?.topProducts ?? []).map((p) => ({
    name: p.name,
    quantity: Number(p.quantity),
  }))

  const stats = [
    {
      title: 'Ventas del Mes',
      value: formatCurrency(kpis?.monthlySales ?? 0),
      description: 'Este mes',
      icon: DollarSign,
      trend: `Hoy: ${formatCurrency(kpis?.todaySales ?? 0)}`,
      trendUp: true,
    },
    {
      title: 'Pedidos',
      value: formatNumber(kpis?.monthlyOrders ?? 0),
      description: 'Este mes',
      icon: ShoppingCart,
      trend: `${kpis?.openOrders ?? 0} pendientes`,
      trendUp: (kpis?.openOrders ?? 0) > 0,
    },
    {
      title: 'Clientes',
      value: formatNumber(kpis?.totalClients ?? 0),
      description: 'Total activos',
      icon: Users,
      trend: 'Registrados',
      trendUp: true,
    },
    {
      title: 'Productos',
      value: formatNumber(kpis?.totalProducts ?? 0),
      description: 'En catálogo',
      icon: Package,
      trend: `${kpis?.lowStockItems ?? 0} stock bajo`,
      trendUp: (kpis?.lowStockItems ?? 0) === 0,
    },
  ]

  const alerts = [
    {
      title: 'Stock Bajo',
      value: formatNumber(kpis?.lowStockItems ?? 0),
      description: 'Productos por agotarse',
      icon: AlertTriangle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Rechazos del Mes',
      value: formatNumber(kpis?.monthlyRejections ?? 0),
      description: 'Ordenes rechazadas',
      icon: XCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Bienvenido, {user?.name?.split(' ')[0] || 'Usuario'}
        </h1>
        <p className="text-muted-foreground mt-1">
          Aquí tienes un resumen de tu negocio
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="p-2 rounded-lg bg-primary/10">
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`flex items-center text-xs font-medium ${
                    stat.trendUp ? 'text-success' : 'text-destructive'
                  }`}
                >
                  {stat.trendUp ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {stat.trend}
                </span>
                <span className="text-xs text-muted-foreground">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {alerts.map((alert) => (
          <Card key={alert.title} className="border-border/50">
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`p-3 rounded-xl ${alert.bgColor}`}>
                <alert.icon className={`h-5 w-5 ${alert.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{alert.title}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">{alert.value}</span>
                  <span className="text-xs text-muted-foreground">{alert.description}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sales Targets (Editable) */}
      <SalesTargetsCard targets={targets} onRefresh={refreshTargets} />

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-border/50">
          <CardHeader>
            <CardTitle>Ventas por Mes</CardTitle>
            <CardDescription>Resumen de ventas de los últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesChart data={salesByMonth} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-border/50">
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
            <CardDescription>Top 5 productos este mes</CardDescription>
          </CardHeader>
          <CardContent>
            <TopProductsChart data={topProducts} />
          </CardContent>
        </Card>
      </div>

      {/* Rejections + Sellers */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RejectionsCard data={rejections} />
        <SellersCard sales={sellerSales} rejections={sellerRejections} />
      </div>
    </div>
  )
}
