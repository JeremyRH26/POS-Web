'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import {
  getModuleCheckboxState,
  getRoleEditorModuleLabel,
  ROLE_EDITOR_MODULE_KEYS,
  toggleModuleCodes,
  type RoleEditorModuleKey,
} from '@/config'
import {
  getRolePermissionsRequest,
  listRolesCatalogRequest,
  updateRolePermissionsRequest,
  type CatalogRole,
} from '@/lib/api'

const MODULE_HINTS: Partial<Record<RoleEditorModuleKey, string>> = {
  inventory: 'Stock y movimientos de productos.',
  sales: 'Crear y editar pedidos (web y app móvil «nueva venta»).',
  clients: 'Catálogo y gestión de clientes.',
  users: 'Usuarios, roles y configuración del sistema.',
  reports: 'Reportes y exportaciones.',
  fel: 'Ver órdenes e imprimir / PDF de entrega (web y pestaña «Ventas» en móvil).',
}

type RolesManagementDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  token: string | null
}

export function RolesManagementDialog({
  open,
  onOpenChange,
  token,
}: RolesManagementDialogProps) {
  const [roles, setRoles] = useState<CatalogRole[]>([])
  const [roleId, setRoleId] = useState<number | null>(null)
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set())
  const [loadingBootstrap, setLoadingBootstrap] = useState(false)
  const [loadingRole, setLoadingRole] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadBootstrap = useCallback(async () => {
    if (!token) return
    setLoadingBootstrap(true)
    try {
      const roleRows = await listRolesCatalogRequest(token)
      setRoles(roleRows)
      if (roleRows.length > 0) {
        const firstId = roleRows[0].roleId
        setRoleId(firstId)
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo cargar roles')
    } finally {
      setLoadingBootstrap(false)
    }
  }, [token])

  const loadRolePermissions = useCallback(
    async (id: number) => {
      if (!token) return
      setLoadingRole(true)
      try {
        const data = await getRolePermissionsRequest(token, id)
        setSelectedCodes(new Set(data.permissions.map((p) => p.code)))
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'No se pudo cargar el rol')
      } finally {
        setLoadingRole(false)
      }
    },
    [token],
  )

  useEffect(() => {
    if (!open || !token) return
    void loadBootstrap()
  }, [open, token, loadBootstrap])

  useEffect(() => {
    if (!open || roleId == null || loadingBootstrap) return
    void loadRolePermissions(roleId)
  }, [open, roleId, loadingBootstrap, loadRolePermissions])

  const setModuleChecked = (key: RoleEditorModuleKey, checked: boolean) => {
    setSelectedCodes((prev) => toggleModuleCodes(prev, key, checked))
  }

  const handleSave = async () => {
    if (!token || roleId == null) return
    setSaving(true)
    try {
      await updateRolePermissionsRequest(token, roleId, [...selectedCodes])
      toast.success('Permisos del rol actualizados', {
        description:
          'Los cambios aplican en la siguiente sesión: los usuarios con este rol deben cerrar sesión y volver a entrar.',
        duration: 6500,
      })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar')
    } finally {
      setSaving(false)
    }
  }

  const selectedRoleName = roles.find((r) => r.roleId === roleId)?.name ?? ''

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full max-h-[100dvh] w-full flex-col gap-0 overflow-hidden border-l p-0 sm:max-w-md md:max-w-lg"
      >
        <SheetHeader className="shrink-0 space-y-2 border-b border-border/50 px-6 pt-6 pb-4 text-left">
          <SheetTitle>Roles y permisos</SheetTitle>
          <SheetDescription>
            Elige un rol y marca los <strong>módulos</strong> de acceso. Algunos aplican a la web, a
            la app móvil o a ambos; cada casilla asigna el conjunto de permisos de ese módulo.
          </SheetDescription>
        </SheetHeader>

        <div className="shrink-0 space-y-3 px-6 py-4">
          {loadingBootstrap ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Spinner className="h-4 w-4" />
              Cargando roles…
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Rol</p>
              <Select
                value={roleId != null ? String(roleId) : ''}
                onValueChange={(v) => setRoleId(Number(v))}
                disabled={roles.length === 0 || loadingRole}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.roleId} value={String(r.roleId)}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRoleName ? (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {roles.find((r) => r.roleId === roleId)?.description}
                </p>
              ) : null}
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 border-y border-border/40 px-0">
          <ScrollArea className="h-[min(520px,calc(100dvh-260px))] md:h-[min(560px,calc(100dvh-240px))]">
            <div className="space-y-3 px-6 py-4 pb-6">
              {loadingRole ? (
                <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                  <Spinner className="h-4 w-4" />
                  Cargando permisos…
                </div>
              ) : (
                ROLE_EDITOR_MODULE_KEYS.map((moduleKey) => {
                  const checked = getModuleCheckboxState(selectedCodes, moduleKey)
                  const label = getRoleEditorModuleLabel(moduleKey)
                  const hint = MODULE_HINTS[moduleKey]
                  return (
                    <label
                      key={moduleKey}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/40"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(c) => setModuleChecked(moduleKey, c === true)}
                        className="mt-0.5"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{label}</p>
                        {hint ? (
                          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
                        ) : null}
                      </div>
                    </label>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </div>

        <SheetFooter className="shrink-0 flex-row flex-wrap gap-2 border-t border-border/50 px-6 py-4 sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || loadingBootstrap || loadingRole || roleId == null}
          >
            {saving ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Guardando…
              </>
            ) : (
              'Guardar cambios'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
