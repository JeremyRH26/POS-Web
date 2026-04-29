'use client'

import { useState, useMemo } from 'react'
import { mockProducts } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PRODUCT_CATEGORIES } from '@/config'
import { Plus, Search, Filter } from 'lucide-react'
import { ProductCard } from './product-card'
import { ProductTable } from './product-table'
import { ProductDialog } from './product-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LayoutGrid, List } from 'lucide-react'
import type { Product } from '@/types'

export function InventoryContent() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [stockFilter, setStockFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [products, setProducts] = useState(mockProducts)

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase())

      const matchesCategory =
        categoryFilter === 'all' || product.category === categoryFilter

      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'low' && product.stock <= product.minStock) ||
        (stockFilter === 'ok' && product.stock > product.minStock)

      return matchesSearch && matchesCategory && matchesStock
    })
  }, [products, search, categoryFilter, stockFilter])

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    setSelectedProduct(null)
    setIsDialogOpen(true)
  }

  const handleSave = (productData: Partial<Product>) => {
    if (selectedProduct) {
      // Update existing product
      setProducts((prev) =>
        prev.map((p) =>
          p.id === selectedProduct.id ? { ...p, ...productData, updatedAt: new Date() } : p
        )
      )
    } else {
      // Create new product
      const newProduct: Product = {
        id: String(Date.now()),
        sku: productData.sku || `SKU-${Date.now()}`,
        name: productData.name || '',
        description: productData.description || '',
        category: productData.category || 'Otros',
        price: productData.price || 0,
        cost: productData.cost || 0,
        stock: productData.stock || 0,
        minStock: productData.minStock || 10,
        image: productData.image,
        discount: productData.discount || 0,
        unit: productData.unit || 'unidad',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setProducts((prev) => [newProduct, ...prev])
    }
    setIsDialogOpen(false)
    setSelectedProduct(null)
  }

  const handleDelete = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId))
  }

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Inventario</h1>
          <p className="text-muted-foreground mt-1">
            {products.length} productos en total
            {lowStockCount > 0 && (
              <span className="text-warning"> - {lowStockCount} con stock bajo</span>
            )}
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o codigo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-3">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {PRODUCT_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo</SelectItem>
              <SelectItem value="low">Stock Bajo</SelectItem>
              <SelectItem value="ok">Stock OK</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Product Views */}
      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="grid">
            <LayoutGrid className="w-4 h-4 mr-2" />
            Cuadrícula
          </TabsTrigger>
          <TabsTrigger value="list">
            <List className="w-4 h-4 mr-2" />
            Lista
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No se encontraron productos</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="list">
          <ProductTable
            products={filteredProducts}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>
      </Tabs>

      <ProductDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        product={selectedProduct}
        onSave={handleSave}
      />
    </div>
  )
}
