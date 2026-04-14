'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDateTime } from '@/utils/format'
import { ShoppingCart, UserPlus, Package, FileText } from 'lucide-react'

const recentActivities = [
  {
    id: '1',
    type: 'sale',
    title: 'Nueva venta registrada',
    description: 'Tienda Don José - 15 productos',
    amount: 2450.00,
    time: new Date(Date.now() - 1000 * 60 * 15),
    icon: ShoppingCart,
  },
  {
    id: '2',
    type: 'client',
    title: 'Nuevo cliente registrado',
    description: 'Mini Super Express - Guatemala',
    time: new Date(Date.now() - 1000 * 60 * 45),
    icon: UserPlus,
  },
  {
    id: '3',
    type: 'inventory',
    title: 'Actualización de inventario',
    description: 'Ingreso de 500 unidades - Coca-Cola 600ml',
    time: new Date(Date.now() - 1000 * 60 * 120),
    icon: Package,
  },
  {
    id: '4',
    type: 'invoice',
    title: 'Factura certificada',
    description: 'FEL-2024-001234 - Distribuidora El Sol',
    amount: 8750.00,
    time: new Date(Date.now() - 1000 * 60 * 180),
    icon: FileText,
  },
  {
    id: '5',
    type: 'sale',
    title: 'Nueva venta registrada',
    description: 'Abarrotería La Bendición - 8 productos',
    amount: 1280.50,
    time: new Date(Date.now() - 1000 * 60 * 240),
    icon: ShoppingCart,
  },
]

const typeColors = {
  sale: 'bg-success/10 text-success',
  client: 'bg-primary/10 text-primary',
  inventory: 'bg-warning/10 text-warning-foreground',
  invoice: 'bg-accent/10 text-accent',
}

export function RecentActivityCard() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
        <CardDescription>
          Últimas acciones en el sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div
                className={`p-2 rounded-lg ${
                  typeColors[activity.type as keyof typeof typeColors]
                }`}
              >
                <activity.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {activity.title}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {activity.description}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {activity.amount && (
                  <Badge variant="secondary" className="font-mono">
                    {formatCurrency(activity.amount)}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDateTime(activity.time)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
