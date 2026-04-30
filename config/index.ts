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
  dashboard: [],
  inventory: ['INVENTORY_VIEW', 'INVENTORY_MANAGE'],
  users: ['USERS_MANAGE', 'ROLES_MANAGE'],
  clients: ['CLIENTS_VIEW', 'CLIENTS_MANAGE'],
  reports: ['REPORTS_VIEW', 'REPORTS_EXPORT'],
  fel: ['ORDERS_VIEW', 'ORDERS_PRINT', 'ORDERS_PDF'],
} as const

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
