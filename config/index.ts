// Global configurations

export const APP_CONFIG = {
  name: 'La Exponencial',
  description: 'Sistema de Distribución',
  version: '1.0.0',
  currency: 'GTQ',
  currencySymbol: 'Q',
  locale: 'es-GT',
  timezone: 'America/Guatemala',
  taxRate: 0.12, // 12% IVA
} as const

export const NAVIGATION_ITEMS = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    module: 'dashboard' as const,
  },
  {
    name: 'Inventario',
    href: '/dashboard/inventory',
    icon: 'Package',
    module: 'inventory' as const,
  },
  {
    name: 'Clientes',
    href: '/dashboard/clients',
    icon: 'Users',
    module: 'clients' as const,
  },
  {
    name: 'Usuarios',
    href: '/dashboard/users',
    icon: 'UserCog',
    module: 'users' as const,
  },
  {
    name: 'Reportes',
    href: '/dashboard/reports',
    icon: 'FileBarChart',
    module: 'reports' as const,
  },
  {
    name: 'FEL',
    href: '/dashboard/fel',
    icon: 'FileText',
    module: 'fel' as const,
  },
] as const

export const ROLE_PERMISSIONS = {
  admin: ['dashboard', 'inventory', 'users', 'clients', 'reports', 'fel'],
  manager: ['dashboard', 'inventory', 'clients', 'reports', 'fel'],
  sales: ['dashboard', 'clients', 'fel'],
  warehouse: ['dashboard', 'inventory'],
} as const

export const MODULE_PERMISSION_CODES = {
  /** Visible para todos los usuarios autenticados (sin códigos). */
  dashboard: [],
  inventory: ['INVENTORY_VIEW', 'INVENTORY_MANAGE'],
  /** Usuarios, roles y parámetros globales del POS. */
  users: ['USERS_MANAGE', 'ROLES_MANAGE', 'SYSTEM_SETTINGS'],
  clients: ['CLIENTS_VIEW', 'CLIENTS_MANAGE'],
  reports: ['REPORTS_VIEW', 'REPORTS_EXPORT'],
  /**
   * Ventas / alta de pedidos (web y app móvil «nueva venta»).
   * No es ítem del menú web; se edita aquí junto al resto de módulos.
   */
  sales: ['ORDERS_CREATE', 'ORDERS_UPDATE'],
  /** FEL en web: consulta de órdenes e impresión / PDF de entrega (también pestaña «Ventas» en móvil). */
  fel: ['ORDERS_VIEW', 'ORDERS_PRINT', 'ORDERS_PDF'],
} as const

/** Módulos editables en «Roles y permisos» (dashboard no lleva códigos). */
export const ROLE_EDITOR_MODULE_KEYS = [
  'inventory',
  'sales',
  'clients',
  'users',
  'reports',
  'fel',
] as const

export type RoleEditorModuleKey = (typeof ROLE_EDITOR_MODULE_KEYS)[number]

export function getRoleEditorModuleLabel(key: RoleEditorModuleKey): string {
  if (key === 'sales') return 'Ventas'
  const item = NAVIGATION_ITEMS.find((n) => n.module === key)
  return item?.name ?? key
}

/** Estado del checkbox de un módulo según los códigos actuales del rol. */
export function getModuleCheckboxState(
  codes: ReadonlySet<string>,
  key: RoleEditorModuleKey,
): boolean | 'indeterminate' {
  const req = MODULE_PERMISSION_CODES[key]
  const present = req.filter((c) => codes.has(c))
  if (present.length === 0) return false
  if (present.length === req.length) return true
  return 'indeterminate'
}

export function toggleModuleCodes(
  codes: ReadonlySet<string>,
  key: RoleEditorModuleKey,
  enable: boolean,
): Set<string> {
  const next = new Set(codes)
  const req = MODULE_PERMISSION_CODES[key]
  if (enable) req.forEach((c) => next.add(c))
  else req.forEach((c) => next.delete(c))
  return next
}

export const PRODUCT_CATEGORIES = [
  'Bebidas',
  'Snacks',
  'Lácteos',
  'Carnes',
  'Abarrotes',
  'Limpieza',
  'Higiene Personal',
  'Otros',
] as const

export const DEPARTMENTS_GT = [
  'Guatemala',
  'Alta Verapaz',
  'Baja Verapaz',
  'Chimaltenango',
  'Chiquimula',
  'El Progreso',
  'Escuintla',
  'Huehuetenango',
  'Izabal',
  'Jalapa',
  'Jutiapa',
  'Petén',
  'Quetzaltenango',
  'Quiché',
  'Retalhuleu',
  'Sacatepéquez',
  'San Marcos',
  'Santa Rosa',
  'Sololá',
  'Suchitepéquez',
  'Totonicapán',
  'Zacapa',
] as const
