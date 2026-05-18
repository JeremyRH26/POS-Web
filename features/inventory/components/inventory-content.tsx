'use client'


import { useEffect, useMemo, useRef, useState } from 'react'
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
import { Plus, Search, Filter, Pencil, Trash2, TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ProductCard } from './product-card'
import { ProductTable } from './product-table'
import { ProductDialog, type ProductFormData } from './product-dialog'
import { ProductDetailSheet } from './product-detail-sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LayoutGrid, List } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { Product } from '@/types'
import { apiClient, ApiError } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'

interface CategoryItem {
  id: string
  name: string
  description: string
}

interface ProductApiItem {
  [key: string]: unknown
}

function normalizeCategory(item: unknown, index: number): CategoryItem {
  if (item && typeof item === 'object') {
    const row = item as Record<string, unknown>
    const id = String(row.category_id ?? row.id ?? index + 1)
    const name = String(row.category_name ?? row.name ?? 'Sin nombre')
    const description = String(row.description ?? row.details ?? '')
    return { id, name, description }
  }

  return {
    id: String(index + 1),
    name: String(item ?? 'Sin nombre'),
    description: '',
  }
}

function parseDate(value: unknown): Date {
  if (value instanceof Date) return value
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) return date
  }
  return new Date()
}

function toSqlDateTime(value: Date) {
  const pad = (part: number) => String(part).padStart(2, '0')
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`
}

function toNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback
  }
  if (typeof value === 'string') {
    const normalized = value.replace(/[^\d.-]/g, '')
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  return fallback
}

function normalizeProduct(item: unknown, index: number): Product {
  const row = (item && typeof item === 'object' ? item : {}) as ProductApiItem
  return {
    id: String(row.id_product ?? row.product_id ?? row.id ?? index + 1),
    sku: String(
      row.sku ??
        row.code ??
        row.codigo ??
        row.product_code ??
        row.cod_producto ??
        row.codigo_producto ??
        row.cod ??
        ''
    ),
    name: String(row.name ?? row.product_name ?? row.nombre ?? 'Sin nombre'),
    description: String(row.description ?? row.details ?? ''),
    category: String(row.category_name ?? row.category ?? row.categoria ?? 'Sin categoria'),
    price: toNumber(row.price ?? row.sale ?? row.sale_price ?? row.precio_venta ?? 0),
    cost: toNumber(
      row.cost ??
        row.purchase_cost ??
        row.precio_costo ??
        row.costo ??
        row.cost_price ??
        row.precioCosto ??
        0
    ),
    expiration: String(
      row.expiration ??
        row.expiration_date ??
        row.expiry_date ??
        row.fecha_vencimiento ??
        row.vencimiento ??
        ''
    ),
    stock: Number(row.stock ?? row.quantity ?? 0),
    minStock: Number(row.min_stock ?? row.minStock ?? 0),
    image: String(row.product_url ?? row.image ?? row.url ?? row.image ??''),
    discount: Number(row.discount ?? 0),
    unit: String(row.unit ?? 'unidad'),
    createdAt: parseDate(row.created_at ?? row.create ?? row.createdAt),
    updatedAt: parseDate(row.updated_at ?? row.update ?? row.updatedAt),
  }
}

export function InventoryContent() {
  const { token } = useAuthStore()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [stockFilter, setStockFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCategoriesDialogOpen, setIsCategoriesDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [productsError, setProductsError] = useState<string | null>(null)
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editCategoryName, setEditCategoryName] = useState('')
  const [editCategoryDescription, setEditCategoryDescription] = useState('')
  const [isSavingCategory, setIsSavingCategory] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null)
  const [isDeletingCategory, setIsDeletingCategory] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isDeletingProduct, setIsDeletingProduct] = useState(false)
  const [detailProduct, setDetailProduct] = useState<Product | null>(null)
  const productDeleteInFlightRef = useRef(false)
  const categoryDeleteInFlightRef = useRef(false)

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

  const handleViewProductDetail = (product: Product) => {
    setDetailProduct(product)
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    setSelectedProduct(null)
    setIsDialogOpen(true)
  }

  const handleSave = async (productData: ProductFormData) => {
    if (!token) {
      toast.error('No hay sesión activa')
      return
    }

    const selectedCategory = categories.find((cat) => cat.name === productData.category)
    const categoryId = selectedCategory?.id ?? null
    const now = new Date()
    const nowSql = toSqlDateTime(now)
    const expiration = productData.expiration
      ? `${productData.expiration} 00:00:00`
      : null

    try {
      const payload = {
        code: selectedProduct ? selectedProduct.sku : productData.sku,
        name: productData.name,
        url: productData.image || null,
        sale: productData.price,
        cost: productData.cost,
        expiration,
        category_id: categoryId,
        created_at: nowSql,
        updated_at: nowSql,
        stock: productData.stock,
        min_stock: productData.minStock,
        st_update: nowSql,
      }

      if (selectedProduct) {
        await apiClient.put(
          `/inventory/products/${encodeURIComponent(selectedProduct.id)}`,
          payload,
          { token }
        )
        setIsDialogOpen(false)
        setSelectedProduct(null)
        await loadProducts()
        return
      } else {
        await apiClient.post('/inventory/products', payload, { token })
      }

      await loadProducts()
      setIsDialogOpen(false)
      setSelectedProduct(null)
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'No se pudo guardar el producto.'
      toast.error(message)
    }
  }

  const handleDelete = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) {
      toast.error('No se encontró el producto.')
      return
    }
    setProductToDelete(product)
  }

  const handleConfirmDeleteProduct = async () => {
    const target = productToDelete
    if (!target || !token) {
      toast.error('No hay sesión activa')
      return
    }
    if (productDeleteInFlightRef.current) return
    productDeleteInFlightRef.current = true

    const idToDelete = target.id

    try {
      setIsDeletingProduct(true)
      await apiClient.delete(
        `/inventory/products/${encodeURIComponent(idToDelete)}`,
        { token }
      )
      toast.success('Producto eliminado')
      if (selectedProduct?.id === idToDelete) {
        setIsDialogOpen(false)
        setSelectedProduct(null)
      }
      setProductToDelete(null)
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'No se pudo eliminar el producto.'
      toast.error(message)
    } finally {
      productDeleteInFlightRef.current = false
      setIsDeletingProduct(false)
      if (token) {
        await loadProducts()
      }
    }
  }

  const loadProducts = async () => {
    if (!token) {
      setProducts([])
      setProductsError('No hay sesión activa para consultar productos.')
      return
    }

    try {
      setIsLoadingProducts(true)
      setProductsError(null)
      const response = await apiClient.get<unknown[]>('/inventory/products', { token })
      const normalized = Array.isArray(response)
        ? response.map((item, index) => normalizeProduct(item, index))
        : []
      setProducts(normalized)
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'No se pudo cargar los productos.'
      setProducts([])
      setProductsError(message)
    } finally {
      setIsLoadingProducts(false)
    }
  }

  const loadCategories = async () => {
    if (!token) {
      setCategories([])
      setCategoriesError('No hay sesión activa para consultar categorías.')
      return
    }

    try {
      setIsLoadingCategories(true)
      setCategoriesError(null)
      const response = await apiClient.get<unknown[]>('/inventory/categories', {
        token,
      })
      const normalized = Array.isArray(response)
        ? response.map((item, index) => normalizeCategory(item, index))
        : []
      setCategories(normalized)
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'No se pudo cargar las categorías.'
      setCategories([])
      setCategoriesError(message)
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const startEditCategory = (category: CategoryItem) => {
    setEditingCategoryId(category.id)
    setEditCategoryName(category.name)
    setEditCategoryDescription(category.description)
  }

  const cancelEditCategory = () => {
    setEditingCategoryId(null)
    setEditCategoryName('')
    setEditCategoryDescription('')
  }

  const handleSaveCategory = async () => {
    const name = editCategoryName.trim()
    const description = editCategoryDescription.trim()

    if (!editingCategoryId) return
    if (!name) {
      toast.error('El nombre de la categoría es requerido')
      return
    }
    if (!token) {
      toast.error('No hay sesión activa')
      return
    }

    try {
      setIsSavingCategory(true)
      await apiClient.put(
        `/inventory/categories/${encodeURIComponent(editingCategoryId)}`,
        { name, description },
        { token }
      )
      toast.success('Categoría actualizada')
      cancelEditCategory()
      await loadCategories()
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'No se pudo actualizar la categoría'
      toast.error(message)
    } finally {
      setIsSavingCategory(false)
    }
  }

  const handleConfirmDeleteCategory = async () => {
    const target = categoryToDelete
    if (!target || !token) {
      toast.error('No hay sesión activa')
      return
    }
    if (categoryDeleteInFlightRef.current) return
    categoryDeleteInFlightRef.current = true

    const idToDelete = target.id

    try {
      setIsDeletingCategory(true)
      await apiClient.delete(
        `/inventory/categories/${encodeURIComponent(idToDelete)}`,
        { token }
      )
      toast.success('Categoría eliminada')
      setCategoryToDelete(null)
      await loadCategories()
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'No se pudo eliminar la categoría'
      toast.error(message)
    } finally {
      categoryDeleteInFlightRef.current = false
      setIsDeletingCategory(false)
    }
  }

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim()
    const description = newCategoryDescription.trim()

    if (!name) {
      toast.error('El nombre de la categoría es requerido')
      return
    }

    if (!token) {
      toast.error('No hay sesión activa')
      return
    }

    try {
      setIsCreatingCategory(true)
      await apiClient.post('/inventory/create_category', { name, description }, { token })
      toast.success('Categoría creada')
      setNewCategoryName('')
      setNewCategoryDescription('')
      setIsCreateCategoryOpen(false)
      await loadCategories()
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'No se pudo crear la categoría'
      toast.error(message)
    } finally {
      setIsCreatingCategory(false)
    }
  }

  useEffect(() => {
    if (isCategoriesDialogOpen) {
      loadCategories()
    }
  }, [isCategoriesDialogOpen])

  useEffect(() => {
    void loadProducts()
  }, [token])

  useEffect(() => {
    if (token) {
      void loadCategories()
    }
  }, [token])

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
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setIsCategoriesDialogOpen(true)}
          >
            Ver categorias
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      {lowStockCount > 0 && !isLoadingProducts && !productsError && (
        <Alert
          className="border-violet-300/70 bg-violet-100/70 text-violet-950 [&>svg]:text-violet-500"
          role="alert"
        >
          <TriangleAlert className="size-4" aria-hidden />
          <AlertTitle>Atención: stock bajo</AlertTitle>
          <AlertDescription className="text-foreground/90">
            {lowStockCount === 1
              ? 'Hay 1 o mas productos con stock bajo en el inventario <<Revisar inventario>>'
              : `Hay ${lowStockCount} productos con stock igual o menor que su mínimo. Revisa el inventario o usa el filtro «Stock Bajo».`}
          </AlertDescription>
        </Alert>
      )}

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
          {productsError && (
            <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {productsError}
            </p>
          )}
          {isLoadingProducts ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Cargando productos...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No se encontraron productos</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetail={handleViewProductDetail}
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
            onViewDetail={handleViewProductDetail}
          />
        </TabsContent>
      </Tabs>

      <ProductDetailSheet
        product={detailProduct}
        open={detailProduct !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDetailProduct(null)
        }}
        token={token}
        onEdit={(p) => {
          setDetailProduct(null)
          handleEdit(p)
        }}
        onDelete={(id) => {
          setDetailProduct(null)
          handleDelete(id)
        }}
      />

      <ProductDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        product={selectedProduct}
        categories={categories}
        onSave={handleSave}
      />

      <Dialog
        open={isCategoriesDialogOpen}
        onOpenChange={setIsCategoriesDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Categorias</DialogTitle>
            <DialogDescription>
              Lista de categorias disponibles para inventario.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-3 space-y-3">
            <div className="flex justify-between">
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsCreateCategoryOpen((prev) => !prev)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Categoria
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadCategories}
                disabled={isLoadingCategories}
              >
                {isLoadingCategories ? 'Cargando...' : 'Recargar'}
              </Button>
            </div>

            {isCreateCategoryOpen && (
              <div className="rounded-md border p-3 space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Nombre</label>
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Ej: Bebidas"
                    disabled={isCreatingCategory}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Descripcion</label>
                  <Input
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    placeholder="Ej: Productos para consumo"
                    disabled={isCreatingCategory}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreateCategoryOpen(false)}
                    disabled={isCreatingCategory}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCreateCategory}
                    disabled={isCreatingCategory}
                  >
                    {isCreatingCategory ? 'Guardando...' : 'Guardar Categoria'}
                  </Button>
                </div>
              </div>
            )}

            {categoriesError && (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {categoriesError}
              </p>
            )}

            {!categoriesError && categories.length === 0 && !isLoadingCategories && (
              <p className="text-sm text-muted-foreground">
                No se recibieron categorías desde la API.
              </p>
            )}

            <ul className="space-y-2 max-h-80 overflow-auto">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="rounded-md border px-3 py-2"
                >
                  {editingCategoryId === category.id ? (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Nombre</label>
                        <Input
                          value={editCategoryName}
                          onChange={(e) => setEditCategoryName(e.target.value)}
                          disabled={isSavingCategory}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Descripcion</label>
                        <Input
                          value={editCategoryDescription}
                          onChange={(e) => setEditCategoryDescription(e.target.value)}
                          disabled={isSavingCategory}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={cancelEditCategory}
                          disabled={isSavingCategory}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleSaveCategory}
                          disabled={isSavingCategory}
                        >
                          {isSavingCategory ? 'Guardando...' : 'Guardar'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{category.name}</p>
                        {category.description && (
                          <p className="mt-1 text-xs text-muted-foreground">{category.description}</p>
                        )}
                        <p className="mt-1 text-[11px] text-muted-foreground/80">ID: {category.id}</p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => startEditCategory(category)}
                          disabled={!!editingCategoryId && editingCategoryId !== category.id}
                          aria-label="Editar categoría"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setCategoryToDelete(category)}
                          disabled={!!editingCategoryId}
                          aria-label="Eliminar categoría"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => {
          if (!open) setCategoryToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar categoría</AlertDialogTitle>
            <AlertDialogDescription>
              {categoryToDelete
                ? `¿Eliminar "${categoryToDelete.name}"? Esta acción no se puede deshacer.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingCategory}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                void handleConfirmDeleteCategory()
              }}
              disabled={isDeletingCategory}
            >
              {isDeletingCategory ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!productToDelete}
        onOpenChange={(open) => {
          if (!open) setProductToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar producto</AlertDialogTitle>
            <AlertDialogDescription>
              {productToDelete
                ? `¿Eliminar "${productToDelete.name}" (${productToDelete.sku})? Esta acción no se puede deshacer.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingProduct}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                void handleConfirmDeleteProduct()
              }}
              disabled={isDeletingProduct}
            >
              {isDeletingProduct ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
