'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, XCircle } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/utils/format'
import type { SellerSales, SellerRejections } from '@/lib/api'

interface SellersCardProps {
  sales: SellerSales[]
  rejections: SellerRejections[]
}

export function SellersCard({ sales, rejections }: SellersCardProps) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle>Rendimiento por Vendedor</CardTitle>
        <CardDescription>Ventas y rechazos del mes actual por vendedor</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sales">
          <TabsList className="mb-4">
            <TabsTrigger value="sales">
              <Users className="h-4 w-4 mr-1" />
              Ventas
            </TabsTrigger>
            <TabsTrigger value="rejections">
              <XCircle className="h-4 w-4 mr-1" />
              Rechazos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sales">
            {sales.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay ventas registradas este mes
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendedor</TableHead>
                    <TableHead className="text-right">Pedidos</TableHead>
                    <TableHead className="text-right">Total Ventas</TableHead>
                    <TableHead className="text-right">Promedio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((s) => (
                    <TableRow key={s.user_id}>
                      <TableCell className="font-medium">{s.seller_name}</TableCell>
                      <TableCell className="text-right">{formatNumber(s.total_orders)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(s.total_sales)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(s.avg_sale)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="rejections">
            {rejections.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay rechazos registrados este mes
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendedor</TableHead>
                    <TableHead className="text-right">Rechazos</TableHead>
                    <TableHead>Razones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rejections.map((r) => (
                    <TableRow key={r.user_id}>
                      <TableCell className="font-medium">{r.seller_name}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="border-destructive text-destructive">
                          {r.total_rejections}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {r.reasons}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
