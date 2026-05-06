'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/utils/format'
import { Plus, Search, Pencil, Trash2, Shield, Users, KeyRound } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import {
  changeUserPasswordRequest,
  createUserRequest,
  deleteUserRequest,
  listUsersRequest,
  updateUserRequest,
  type BackendUser,
  type UpsertUserPayload,
} from '@/lib/api'
import { ROLE_OPTIONS, UserDialog, type UserDialogModel } from './user-dialog'
import { RolesManagementDialog } from './roles-management-dialog'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
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

const roleColors: Record<number, string> = {
  1: 'bg-primary/10 text-primary border-primary/20',
  2: 'bg-accent/10 text-accent border-accent/20',
  3: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  4: 'bg-muted text-muted-foreground border-muted',
}

export function UsersContent() {
  const token = useAuthStore((s) => s.token)
  const permissionCodes = useAuthStore((s) => s.permissionCodes)
  const currentUserId = useAuthStore((s) => s.user?.id ?? null)
  const canManageRoles = permissionCodes.includes('ROLES_MANAGE')
  const [users, setUsers] = useState<BackendUser[]>([])
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<BackendUser | null>(null)
  const [userToDelete, setUserToDelete] = useState<BackendUser | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [statusToggleUserId, setStatusToggleUserId] = useState<string | null>(null)
  const [rolesDialogOpen, setRolesDialogOpen] = useState(false)

  const loadUsers = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const rows = await listUsersRequest(token)
      setUsers(rows)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo cargar usuarios')
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const term = search.toLowerCase()
        return (
          user.fullName.toLowerCase().includes(term) ||
          user.username.toLowerCase().includes(term)
        )
      }),
    [search, users]
  )

  const handleEdit = (user: BackendUser) => {
    setSelectedUser(user)
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    setSelectedUser(null)
    setIsDialogOpen(true)
  }

  const handleSave = async (userData: UpsertUserPayload) => {
    if (!token) {
      toast.error('Sesión inválida')
      return
    }
    try {
      if (selectedUser) {
        await updateUserRequest(token, selectedUser.id, userData)
        if (userData.password && userData.password.trim().length > 0) {
          await changeUserPasswordRequest(token, selectedUser.id, userData.password)
        }
        toast.success('Usuario actualizado')
      } else {
        await createUserRequest(token, userData)
        toast.success('Usuario creado')
      }
      await loadUsers()
      setIsDialogOpen(false)
      setSelectedUser(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo guardar')
    }
  }

  const handleToggleActive = async (user: BackendUser, nextStatus: 0 | 1) => {
    if (!token) {
      toast.error('Sesión inválida')
      return
    }
    if (String(user.id) === String(currentUserId)) {
      toast.error('Para cambiar tu propio estado usa el botón Editar')
      return
    }
    setStatusToggleUserId(user.id)
    try {
      await updateUserRequest(token, user.id, {
        fullName: user.fullName,
        username: user.username,
        phoneNumber: user.phoneNumber,
        roleId: user.roleId,
        userStatus: nextStatus,
      })
      toast.success(nextStatus === 1 ? 'Usuario activado' : 'Usuario desactivado')
      await loadUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo actualizar el estado')
    } finally {
      setStatusToggleUserId(null)
    }
  }

  const handleDelete = async () => {
    if (!userToDelete) return
    if (!token) {
      toast.error('Sesión inválida')
      return
    }
    setIsDeleting(true)
    try {
      await deleteUserRequest(token, userToDelete.id)
      toast.success('Usuario eliminado')
      await loadUsers()
      setUserToDelete(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo eliminar')
    } finally {
      setIsDeleting(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const usersByRole = {
    1: users.filter((u) => Number(u.roleId) === 1).length,
    2: users.filter((u) => Number(u.roleId) === 2).length,
    3: users.filter((u) => Number(u.roleId) === 3).length,
    4: users.filter((u) => Number(u.roleId) === 4).length,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Usuarios</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los usuarios y permisos del sistema
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canManageRoles ? (
            <Button variant="outline" onClick={() => setRolesDialogOpen(true)}>
              <KeyRound className="w-4 h-4 mr-2" />
              Roles y permisos
            </Button>
          ) : null}
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Role Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ROLE_OPTIONS.map((role) => (
          <Card key={role.roleId} className="border-border/50">
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`p-3 rounded-xl ${roleColors[role.roleId].split(' ')[0]}`}>
                {role.roleId === 1 ? (
                  <Shield className={`h-5 w-5 ${roleColors[role.roleId].split(' ')[1]}`} />
                ) : (
                  <Users className={`h-5 w-5 ${roleColors[role.roleId].split(' ')[1]}`} />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{role.roleName}</p>
                <p className="text-2xl font-bold text-foreground">{usersByRole[role.roleId]}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Table */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Lista de Usuarios</CardTitle>
              <CardDescription>{users.length} usuarios registrados en BD</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuario..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Permisos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha de Registro</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="inline-flex items-center gap-2 text-muted-foreground">
                      <Spinner className="h-4 w-4" />
                      Cargando usuarios...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-muted-foreground">No se encontraron usuarios</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{user.fullName}</p>
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={roleColors[Number(user.roleId)]}
                      >
                        {user.roleName}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground">
                        Definidos por rol
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.userStatus === 1}
                          disabled={
                            statusToggleUserId === user.id ||
                            String(user.id) === String(currentUserId)
                          }
                          onCheckedChange={(checked) => {
                            const next = checked ? 1 : 0
                            const current = user.userStatus === 1 ? 1 : 0
                            if (next === current) return
                            void handleToggleActive(user, next)
                          }}
                          title={
                            String(user.id) === String(currentUserId)
                              ? 'Tu estado solo desde Editar'
                              : user.userStatus === 1
                                ? 'Desactivar usuario'
                                : 'Activar usuario'
                          }
                        />
                        <span className="text-sm text-muted-foreground">
                          {user.userStatus === 1 ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(user)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setUserToDelete(user)}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RolesManagementDialog
        open={rolesDialogOpen}
        onOpenChange={setRolesDialogOpen}
        token={token}
      />

      <UserDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        user={
          selectedUser
            ? ({
                id: selectedUser.id,
                fullName: selectedUser.fullName,
                username: selectedUser.username,
                phoneNumber: selectedUser.phoneNumber,
                roleId: selectedUser.roleId,
                roleName: selectedUser.roleName,
                userStatus: selectedUser.userStatus,
              } satisfies UserDialogModel)
            : null
        }
        onSave={handleSave}
      />

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará de forma permanente a{' '}
              <span className="font-medium">{userToDelete?.fullName}</span>. No se podrá deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                void handleDelete()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Sí, Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
