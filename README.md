# La Exponencial - POS Web

## Requisitos

Antes de iniciar, asegúrate de tener instalado:

- Node.js 18 o superior
- pnpm

## Instalación

1. Clona el repositorio.
2. Entra a la carpeta del proyecto.
3. Instala las dependencias:

```bash
pnpm install
```

## Cómo iniciar el proyecto

Para correr el proyecto en desarrollo:

```bash
pnpm dev
```

Luego abre en tu navegador:

```bash
http://localhost:3000
```

## Scripts disponibles

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```

## Credenciales de prueba

Este proyecto usa autenticación simulada. Puedes ingresar con cualquiera de estas cuentas:

- Admin: `admin@exponencial.com` / `admin123`
- Gerente: `manager@exponencial.com` / `manager123`
- Ventas: `sales@exponencial.com` / `sales123`

## Módulos del sistema

- Dashboard: resumen general del negocio con métricas y gráficas
- Inventario: catálogo de productos, filtros y control de stock
- Clientes: administración de clientes, balance y ubicación
- Usuarios: administración de usuarios, roles y permisos
- Reportes: generación y descarga de reportes
- FEL: sección para configuración de facturación electrónica

## Rutas principales

- `/` - pantalla de login
- `/dashboard` - panel principal
- `/dashboard/inventory` - inventario
- `/dashboard/clients` - clientes
- `/dashboard/users` - usuarios
- `/dashboard/reports` - reportes
- `/dashboard/fel` - FEL

## Compilación para producción

```bash
pnpm build
pnpm start
```
