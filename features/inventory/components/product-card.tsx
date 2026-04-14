'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatCurrency } from '@/utils/format'
import type { Product } from '@/types'
import { MoreVertical, Pencil, Trash2, Package } from 'lucide-react'

interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const isLowStock = product.stock <= product.minStock
  const hasDiscount = product.discount && product.discount > 0
  const discountedPrice = hasDiscount
    ? product.price * (1 - product.discount / 100)
    : product.price

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-border transition-colors">
      <div className="relative aspect-square bg-muted/30 flex items-center justify-center">
        {product.image ? (
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${product.image})` }}
          />
        ) : (
          <Package className="w-16 h-16 text-muted-foreground/30" />
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
            -{product.discount}%
          </Badge>
        )}

        {/* Low Stock Badge */}
        {isLowStock && (
          <Badge
            variant="outline"
            className="absolute top-2 right-2 border-warning text-warning-foreground bg-warning/10"
          >
            Stock Bajo
          </Badge>
        )}

        {/* Actions */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(product)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(product.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
                <span className="text-lg font-bold text-foreground">
                  {formatCurrency(discountedPrice)}
                </span>
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
