'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/utils/format'
import type { Product } from '@/types'
import { Package } from 'lucide-react'

interface ProductCardProps {
  product: Product
  onViewDetail?: (product: Product) => void
}

export function ProductCard({ product, onViewDetail }: ProductCardProps) {
  const isLowStock = product.stock <= product.minStock
  const hasDiscount = product.discount && product.discount > 0


  return (
    <Card
      role={onViewDetail ? 'button' : undefined}
      tabIndex={onViewDetail ? 0 : undefined}
      className={`overflow-hidden border-border/50 transition-colors hover:border-border ${
        onViewDetail ? 'cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none' : ''
      }`}
      onClick={() => onViewDetail?.(product)}
      onKeyDown={(e) => {
        if (!onViewDetail) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onViewDetail(product)
        }
      }}
    >
      <div className="relative aspect-square bg-muted/30 flex items-center justify-center">
        {product.image ? (
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${product.image})` }}
          />
        ) : (
          <Package className="w-16 h-16 text-muted-foreground/30" />
        )}

        {hasDiscount && (
          <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
            -{product.discount}%
          </Badge>
        )}

        {isLowStock && (
          <Badge
            variant="outline"
            className="absolute top-2 right-2 border-warning text-warning-foreground bg-warning/10"
          >
            Stock Bajo
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>
            <h3 className="font-medium text-foreground truncate mt-1">
              {product.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div>
            {hasDiscount ? (
              <div className="flex items-baseline gap-2">

                <span className="text-sm text-muted-foreground line-through">
                  {formatCurrency(product.price)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-foreground">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
          <div className="text-right">
            <span
              className={`text-sm font-medium ${
                isLowStock ? 'text-warning' : 'text-muted-foreground'
              }`}
            >
              {product.stock} {product.unit}s
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <Badge variant="secondary" className="text-xs">
            {product.category}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
