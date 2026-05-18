'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { XCircle } from 'lucide-react'
import type { RejectionMetric } from '@/lib/api'

interface RejectionsCardProps {
  data: RejectionMetric[]
}

const COLORS = [
  'bg-destructive/10 text-destructive',
  'bg-warning/10 text-warning-foreground',
  'bg-chart-4/10 text-chart-4',
  'bg-primary/10 text-primary',
  'bg-accent/10 text-accent',
]

export function RejectionsCard({ data }: RejectionsCardProps) {
  const total = data.reduce((s, d) => s + d.total_rejections, 0)

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-destructive" />
          Métrica de Rechazos
        </CardTitle>
        <CardDescription>Razones de rechazo del mes actual</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay rechazos registrados este mes
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold text-foreground">{total}</span>
              <span className="text-sm text-muted-foreground">rechazos este mes</span>
            </div>
            {data.map((item, i) => (
              <div key={item.reason} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={`w-3 h-3 rounded-full ${COLORS[i % COLORS.length].split(' ')[0]}`} />
                  <span className="text-sm text-foreground truncate">{item.reason}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{item.total_rejections}</Badge>
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
