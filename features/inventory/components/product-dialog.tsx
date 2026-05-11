'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { PRODUCT_CATEGORIES } from '@/config'
import type { Product } from '@/types'
import { toast } from 'sonner'

interface CategoryOption {
  id: string
  name: string
}

export interface ProductFormData {
  sku: string
  name: string
  description: string
  category: string
  price: number
  cost: number
  stock: number
  minStock: number
  discount: number
  unit: string
  image: string
  expiration: string
}

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  categories: CategoryOption[]
  onSave: (product: ProductFormData) => Promise<void> | void
}

export function ProductDialog({
  open,
  onOpenChange,
  product,
  categories,
  onSave,
}: ProductDialogProps) {
  const toDateInputValue = (value?: string) => {
    if (!value) return ''
    if (value.includes('T')) return value.slice(0, 10)
    if (value.includes(' ')) return value.slice(0, 10)
    return value
  }

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category: 'Otros',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 10,
    discount: 0,
    unit: '',
    image: '',
    expiration: '',
  })

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku,
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        minStock: product.minStock,
        discount: product.discount || 0,
        unit: product.unit,
        image: product.image || '',
        expiration: toDateInputValue(product.expiration),
      })
    } else {
      setFormData({
        sku: '',
        name: '',
        description: '',
        category: 'Otros',
        price: 0,
        cost: 0,
        stock: 0,
        minStock: 10,
        discount: 0,
        unit: '',
        image: '',
        expiration: '',
      })
    }
  }, [product, open])

  const categoryOptions =
    categories.length > 0
      ? categories.map((cat) => cat.name)
      : PRODUCT_CATEGORIES

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.sku) {
      toast.error('El nombre y el codigo son requeridos')
      return
    }

    if (formData.price < 0 || formData.cost < 0) {
      toast.error('El precio y costo deben ser mayores a 0')
      return
    }

    await onSave(formData)
    toast.success(product ? 'Producto actualizado' : 'Producto creado')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
          <DialogDescription>
            {product
              ? 'Modifica los datos del producto'
              : 'Ingresa los datos del nuevo producto'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="sku">Codigo *</FieldLabel>
                <Input
                  id="sku"
                  value={formData.sku}
                  readOnly={!!product}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value.toUpperCase() })
                  }
                  placeholder="Eje: BEB-001"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="category">Categoría</FieldLabel>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="name">Nombre del Producto *</FieldLabel>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ejem: Coca-Cola 600ml"
              />
            </Field>

            {/*<Field>
              <FieldLabel htmlFor="description">Descripción</FieldLabel>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descripción del producto..."
                rows={2}
              />
            </Field>*/}

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="expiration">Fecha de Vencimiento</FieldLabel>
                <Input
                  id="expiration"
                  type="date"
                  value={formData.expiration}
                  onChange={(e) =>
                    setFormData({ ...formData, expiration: e.target.value })
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="price">Precio de Venta (Q)</FieldLabel>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="cost">Costo (Q)</FieldLabel>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost}
                  onChange={(e) =>
                    setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })
                  }
                />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Field>
                <FieldLabel htmlFor="stock">Stock Actual</FieldLabel>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="minStock">Stock Mínimo</FieldLabel>
                <Input
                  id="minStock"
                  type="number"
                  min="0"
                  value={formData.minStock}
                  onChange={(e) =>
                    setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })
                  }
                />
              </Field>
              {/*<Field>
                <FieldLabel htmlFor="discount">Descuento (%)</FieldLabel>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={(e) =>
                    setFormData({ ...formData, discount: parseInt(e.target.value) || 0 })
                  }
                />
              </Field>*/}
            </div>
            <Field>
              <FieldLabel htmlFor="image">URL de Imagen</FieldLabel>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                placeholder="https://..."
              />
            </Field>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {product ? 'Guardar Cambios' : 'Crear Producto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
