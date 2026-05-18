const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

interface ApiResponse<T = unknown> {
  status: number
  message: string
  data: T
}

let cachedToken: string | null = null

async function getToken(): Promise<string> {
  if (cachedToken) return cachedToken
  const res = await fetch(`${API_BASE_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@test.com', password: 'password123' }),
  })
  const json = await res.json()
  cachedToken = json.data?.token ?? null
  return cachedToken!
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (res.status === 401) {
    cachedToken = null
    const retryToken = await getToken()
    headers['Authorization'] = `Bearer ${retryToken}`
    const retry = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers })
    const retryJson: ApiResponse<T> = await retry.json()
    if (!retry.ok) throw new Error(retryJson.message || 'API error')
    return retryJson.data
  }

  const json: ApiResponse<T> = await res.json()

  if (!res.ok) {
    throw new Error(json.message || 'API error')
  }

  return json.data
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),

  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
}

// ---- Dashboard ----
export interface DashboardKpis {
  todaySales: number
  openOrders: number
  lowStockItems: number
  monthlySales: number
  monthlyOrders: number
  totalClients: number
  totalProducts: number
  monthlyRejections: number
}

export interface SalesByMonth {
  period: string
  month_label: string
  total_sales: number
}

export interface TopProduct {
  name: string
  quantity: number
}

export interface DashboardSummary {
  kpis: DashboardKpis
  salesByMonth: SalesByMonth[]
  topProducts: TopProduct[]
}

export interface SalesTarget {
  target_id: number
  user_id: number | null
  user_name: string | null
  route_id: number | null
  route_name: string | null
  product_id: number | null
  product_name: string | null
  type: string
  target_amount: number
  start_date: string
  end_date: string
  current_value: number
}

export interface SalesTargetPayload {
  target_id?: number | null
  user_id?: number | null
  route_id?: number | null
  product_id?: number | null
  type: string
  target_amount: number
  start_date: string
  end_date: string
}

export interface RejectionMetric {
  reason: string
  total_rejections: number
  percentage: number
}

export interface SellerSales {
  user_id: number
  seller_name: string
  total_orders: number
  total_sales: number
  avg_sale: number
}

export interface SellerRejections {
  user_id: number
  seller_name: string
  total_rejections: number
  reasons: string
}

export const dashboardApi = {
  getSummary: () => api.get<DashboardSummary>('/dashboard/summary'),
  getSalesTargets: () => api.get<SalesTarget[]>('/dashboard/sales-targets'),
  upsertSalesTarget: (target: SalesTargetPayload) =>
    api.post<{ target_id: number }>('/dashboard/sales-targets', target),
  deleteSalesTarget: (id: number) =>
    api.delete(`/dashboard/sales-targets/${id}`),
  getRejectionMetrics: () =>
    api.get<RejectionMetric[]>('/dashboard/rejection-metrics'),
  getSalesBySeller: () =>
    api.get<SellerSales[]>('/dashboard/sales-by-seller'),
  getRejectionsBySeller: () =>
    api.get<SellerRejections[]>('/dashboard/rejections-by-seller'),
}

// ---- Reports ----
export interface CategorySalesSummary {
  category_id: number
  category_name: string
  total_orders: number
  total_units: number
  gross_amount: number
  total_discount: number
  net_amount: number
}

export interface CategorySalesDetail {
  category_name: string
  product_id: number
  product_code: string
  product_name: string
  total_units: number
  unit_price: number
  gross_amount: number
  total_discount: number
  net_amount: number
}

export interface SalesByCategoryReport {
  summary: CategorySalesSummary[]
  details: CategorySalesDetail[]
}

export interface ExpiringProduct {
  product_id: number
  product_code: string
  product_name: string
  category_name: string
  expiration_date: string
  days_until_expiry: number
  current_stock: number
  sale_price: number
  inventory_value_at_risk: number
  urgency: 'VENCIDO' | 'CRITICO' | 'URGENTE' | 'PROXIMO'
}

export interface LowStockProduct {
  product_id: number
  product_code: string
  product_name: string
  category_name: string
  current_stock: number
  min_stock: number
  stock_status: 'SIN_STOCK' | 'BAJO' | 'OK'
  sale_price: number
  cost_price: number
  units_needed: number
  restock_cost: number
}

export const reportingApi = {
  salesByCategory: (startDate: string, endDate: string) =>
    api.get<SalesByCategoryReport>(
      `/reporting/sales-by-category?start_date=${startDate}&end_date=${endDate}`
    ),
  productsExpiring: (days = 30) =>
    api.get<ExpiringProduct[]>(`/reporting/products-expiring?days=${days}`),
  productsLowStock: () =>
    api.get<LowStockProduct[]>('/reporting/products-low-stock'),
}
