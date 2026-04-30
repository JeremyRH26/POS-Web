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
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { UpsertUserPayload } from '@/lib/api'
import { Eye, EyeOff } from 'lucide-react'

export const ROLE_OPTIONS = [
  { roleId: 1, roleName: 'Super administrador' },
  { roleId: 2, roleName: 'Prevendedor' },
  { roleId: 3, roleName: 'Repartidor' },
  { roleId: 4, roleName: 'Bodega' },
] as const

const ROLE_PERMISSION_CODES: Record<number, string[]> = {
  1: [
    'USERS_MANAGE',
    'ROLES_MANAGE',
    'ORDERS_CREATE',
    'ORDERS_VIEW',
    'ORDERS_UPDATE',
    'ORDERS_PRINT',
    'ORDERS_PDF',
    'INVENTORY_VIEW',
    'INVENTORY_MANAGE',
    'CLIENTS_VIEW',
    'CLIENTS_MANAGE',
    'REPORTS_VIEW',
    'REPORTS_EXPORT',
    'SYSTEM_SETTINGS',
  ],
  2: [
    'ORDERS_CREATE',
    'ORDERS_VIEW',
    'ORDERS_UPDATE',
    'INVENTORY_VIEW',
    'INVENTORY_MANAGE',
    'CLIENTS_VIEW',
    'CLIENTS_MANAGE',
  ],
  3: ['ORDERS_VIEW', 'ORDERS_PRINT', 'ORDERS_PDF'],
  4: ['INVENTORY_VIEW', 'INVENTORY_MANAGE', 'REPORTS_VIEW', 'REPORTS_EXPORT'],
}

const PERMISSION_LABELS: Record<string, string> = {
  USERS_MANAGE: 'Administrar Usuarios',
  ROLES_MANAGE: 'Administrar Roles',
  ORDERS_CREATE: 'Crear Órdenes',
  ORDERS_VIEW: 'Ver Órdenes',
  ORDERS_UPDATE: 'Editar Órdenes',
  ORDERS_PRINT: 'Imprimir Documentos',
  ORDERS_PDF: 'Generar Pdf Entrega',
  INVENTORY_VIEW: 'Ver Inventario',
  INVENTORY_MANAGE: 'Gestionar Inventario',
  CLIENTS_VIEW: 'Ver Clientes',
  CLIENTS_MANAGE: 'Gestionar Clientes',
  REPORTS_VIEW: 'Ver Reportes',
  REPORTS_EXPORT: 'Exportar Reportes',
  SYSTEM_SETTINGS: 'Configuración Sistema',
}

function permissionLabel(code: string): string {
  return PERMISSION_LABELS[code] ?? code
}

export type UserDialogModel = {
  id: string
  fullName: string
  username: string
  phoneNumber: string | null
  roleId: number
  roleName: string
  userStatus: number
}

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserDialogModel | null
  onSave: (user: UpsertUserPayload) => Promise<void>
}

export function UserDialog({ open, onOpenChange, user, onSave }: UserDialogProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    phoneNumber: '',
    roleId: 2,
    password: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        username: user.username,
        phoneNumber: user.phoneNumber ?? '',
        roleId: user.roleId,
        password: '',
      })
    } else {
      setFormData({
        fullName: '',
        username: '',
        phoneNumber: '',
        roleId: 2,
        password: '',
      })
    }
  }, [user, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.fullName || !formData.username) {
      toast.error('El nombre y usuario son requeridos')
      return
    }

    if (!user && !formData.password) {
      toast.error('La contraseña es requerida para nuevos usuarios')
      return
    }

    setIsSaving(true)
    void onSave({
      fullName: formData.fullName.trim(),
      username: formData.username.trim(),
      phoneNumber: formData.phoneNumber.trim() || null,
      roleId: Number(formData.roleId),
      userStatus: user ? user.userStatus : 1,
      password: formData.password || undefined,
    }).finally(() => setIsSaving(false))
  }

  const currentPermissions = ROLE_PERMISSION_CODES[Number(formData.roleId)] ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>{user ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
          <DialogDescription>
            {user
              ? 'Modifica los datos del usuario'
              : 'Ingresa los datos del nuevo usuario'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="pb-1">
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="fullName">Nombre Completo *</FieldLabel>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Juan Pérez"
                disabled={isSaving}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="username">Usuario *</FieldLabel>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="administrador"
                disabled={isSaving}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="phoneNumber">Teléfono</FieldLabel>
              <Input
                id="phoneNumber"
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="50050055"
                disabled={isSaving}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">
                {user ? 'Nueva Contraseña (Opcional)' : 'Contraseña *'}
              </FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder={user ? 'Dejar en blanco para no cambiar' : 'Mínimo 8 caracteres'}
                  disabled={isSaving}
                  className="no-native-password-toggle pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSaving}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  </span>
                </Button>
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="role">Rol</FieldLabel>
              <Select
                value={String(formData.roleId)}
                onValueChange={(value) =>
                  setFormData({ ...formData, roleId: Number(value) })
                }
                disabled={isSaving}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((role) => (
                    <SelectItem key={role.roleId} value={String(role.roleId)}>
                      {role.roleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div>
              <p className="text-sm font-medium text-foreground mb-2">
                Permisos del Rol
              </p>
              <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-muted/50">
                {currentPermissions.map((perm) => (
                  <Badge key={perm} variant="secondary">
                    {permissionLabel(perm)}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Los permisos se asignan automáticamente según el rol seleccionado
              </p>
            </div>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {user ? 'Guardar Cambios' : 'Crear Usuario'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
