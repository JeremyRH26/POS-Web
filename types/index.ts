// Shared types used across the application

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  /** Nombre del rol como viene de la API (ej. Super administrador). */
  roleName?: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
  permissions: Permission[]
}

export type UserRole = 'admin' | 'manager' | 'sales' | 'warehouse'

export interface Permission {
  id: string
  name: string
  description: string
  module: ModuleName
}

export type ModuleName = 'dashboard' | 'inventory' | 'users' | 'clients' | 'reports' | 'fel'

export interface Product {
  id: string
  sku: string
  name: string
  description: string
  category: string
  price: number
  cost: number
  expiration?: string
  stock: number
  minStock: number
  image?: string
  discount?: number
  unit: string
  createdAt: Date
  updatedAt: Date
}

export interface Client {
  id: string
  name: string
  nit: string
  email: string
  phone: string
  address: string
  city: string
  department: string
  latitude?: number
  longitude?: number
  creditLimit: number
  balance: number
  createdAt: Date
  updatedAt: Date
}

export interface Invoice {
  id: string
  number: string
  clientId: string
  client?: Client
  items: InvoiceItem[]
  subtotal: number
  discount: number
  tax: number
  total: number
  status: InvoiceStatus
  felStatus?: FelStatus
  felUUID?: string
  createdAt: Date
}

export interface InvoiceItem {
  id: string
  productId: string
  product?: Product
  quantity: number
  price: number
  discount: number
  total: number
}

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'cancelled'
export type FelStatus = 'pending' | 'certified' | 'cancelled' | 'error'

export interface DashboardMetrics {
  totalSales: number
  totalOrders: number
  totalClients: number
  totalProducts: number
  lowStockProducts: number
  pendingInvoices: number
  salesByMonth: { month: string; sales: number }[]
  topProducts: { name: string; quantity: number }[]
  recentSales: { date: string; amount: number }[]
}

export interface ReportFilters {
  startDate: Date
  endDate: Date
  type: ReportType
  format: 'pdf' | 'excel'
}

export type ReportType = 'sales' | 'inventory' | 'clients' | 'products'
