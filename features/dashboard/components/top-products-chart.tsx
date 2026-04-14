'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { formatNumber } from '@/utils/format'

interface TopProductsChartProps {
  data: { name: string; quantity: number }[]
}

const COLORS = [
  'oklch(var(--chart-1))',
  'oklch(var(--chart-2))',
  'oklch(var(--chart-3))',
  'oklch(var(--chart-4))',
  'oklch(var(--chart-5))',
]

export function TopProductsChart({ data }: TopProductsChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
        >
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'oklch(var(--muted-foreground))', fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'oklch(var(--muted-foreground))', fontSize: 11 }}
            width={100}
            tickFormatter={(value) =>
              value.length > 15 ? `${value.slice(0, 15)}...` : value
            }
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                    <p className="text-sm font-medium text-foreground">
                      {payload[0].payload.name}
                    </p>
                    <p className="text-sm text-accent font-semibold">
                      {formatNumber(payload[0].value as number)} unidades
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar dataKey="quantity" radius={[0, 4, 4, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
