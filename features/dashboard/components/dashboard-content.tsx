'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { mockDashboardMetrics } from '@/lib/mock-data'
import { formatCurrency, formatNumber } from '@/utils/format'
import { useAuthStore } from '@/stores/auth-store'
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  FileText,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { SalesChart } from './sales-chart'
import { TopProductsChart } from './top-products-chart'
import { RecentActivityCard } from './recent-activity-card'

export function DashboardContent() {
  const { user } = useAuthStore()
  const metrics = mockDashboardMetrics

  const stats = [
    {
      title: 'Ventas Totales',
      value: formatCurrency(metrics.totalSales),
      description: 'Este mes',
      icon: DollarSign,
      trend: '+12.5%',
      trendUp: true,
    },
    {
      title: 'Pedidos',
      value: formatNumber(metrics.totalOrders),
      description: 'Este mes',
      icon: ShoppingCart,
      trend: '+8.2%',
      trendUp: true,
    },
    {
      title: 'Clientes',
      value: formatNumber(metrics.totalClients),
      description: 'Total activos',
      icon: Users,
      trend: '+3 nuevos',
      trendUp: true,
    },
    {
      title: 'Productos',
      value: formatNumber(metrics.totalProducts),
      description: 'En catálogo',
      icon: Package,
      trend: '156 SKUs',
      trendUp: true,
    },
  ]

  const alerts = [
    {
      title: 'Stock Bajo',
      value: formatNumber(metrics.lowStockProducts),
      description: 'Productos por agotarse',
      icon: AlertTriangle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Facturas Pendientes',
      value: formatNumber(metrics.pendingInvoices),
      description: 'Por certificar',
      icon: FileText,
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10',
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

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-border/50">
          <CardHeader>
            <CardTitle>Ventas por Mes</CardTitle>
            <CardDescription>
              Resumen de ventas de los últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SalesChart data={metrics.salesByMonth} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-border/50">
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
            <CardDescription>
              Top 5 productos este mes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TopProductsChart data={metrics.topProducts} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <RecentActivityCard />
    </div>
  )
}
