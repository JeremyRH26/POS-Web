import { notifySessionInvalid } from '@/lib/unauthorized-bridge'

type Envelope<T> = {
  status: number
  message: string
  data: T
}

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const cleanApiUrl = rawApiUrl.replace(/\/$/, '')
const apiBase = cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`

/** Respuesta 401 con Bearer: revoca sesión en cliente (misma lógica que app móvil: cerrar sesión al leer 401). */
async function throwIfSessionUnauthorized(
  res: Response,
  fallbackMessage = 'Sesión no válida o cuenta desactivada'
): Promise<void> {
  if (res.status !== 401) return
  notifySessionInvalid()
  let message = fallbackMessage
  try {
    const body = (await res.json()) as Envelope<unknown>
    if (body?.message && typeof body.message === 'string') message = body.message
  } catch {
    // respuesta vacía o no JSON
  }
  throw new Error(message)
}

export type BackendUser = {
  id: string
  userId: number
  fullName: string
  username: string
  phoneNumber: string | null
  roleId: number
  roleName: string
  userStatus: number
  createdAt: string
  updatedAt: string
}

export type UpsertUserPayload = {
  fullName: string
  username: string
  phoneNumber: string | null
  roleId: number
  userStatus?: number
  password?: string
}

export type LoginData = {
  token: string
  tokenType: string
  expiresIn: string
  user: {
    id: string
    fullName: string
    username: string
    roleId: number
    roleName: string
    permissions: string[]
  }
}

export async function loginRequest(username: string, password: string): Promise<LoginData> {
  const res = await fetch(`${apiBase}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  const body = (await res.json()) as Envelope<LoginData>
  if (!res.ok) {
    throw new Error(body?.message || 'No se pudo iniciar sesión')
  }
  return body.data
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

/** Valida token + usuario activo en BD (mismo middleware que el resto de rutas). */
export async function validateSessionRequest(token: string): Promise<void> {
  const res = await fetch(`${apiBase}/users/me`, {
    method: 'GET',
    headers: authHeaders(token),
  })
  await throwIfSessionUnauthorized(res)
  if (!res.ok) {
    let message = 'No se pudo validar la sesión'
    try {
      const body = (await res.json()) as Envelope<unknown>
      if (body?.message && typeof body.message === 'string') message = body.message
    } catch {
      // ignore
    }
    throw new Error(message)
  }
}

export async function listUsersRequest(token: string): Promise<BackendUser[]> {
  const res = await fetch(`${apiBase}/users?includeInactive=1`, {
    method: 'GET',
    headers: authHeaders(token),
  })
  await throwIfSessionUnauthorized(res)
  const body = (await res.json()) as Envelope<BackendUser[]>
  if (!res.ok) {
    throw new Error(body?.message || 'No se pudo cargar usuarios')
  }
  return body.data
}

export async function createUserRequest(token: string, payload: UpsertUserPayload): Promise<BackendUser> {
  const res = await fetch(`${apiBase}/users`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      fullName: payload.fullName,
      username: payload.username,
      password: payload.password,
      phoneNumber: payload.phoneNumber,
      roleId: payload.roleId,
    }),
  })
  await throwIfSessionUnauthorized(res)
  const body = (await res.json()) as Envelope<BackendUser>
  if (!res.ok) {
    throw new Error(body?.message || 'No se pudo crear el usuario')
  }
  return body.data
}

export async function updateUserRequest(
  token: string,
  userId: string,
  payload: UpsertUserPayload
): Promise<BackendUser> {
  const res = await fetch(`${apiBase}/users/${userId}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({
      fullName: payload.fullName,
      username: payload.username,
      phoneNumber: payload.phoneNumber,
      roleId: payload.roleId,
      userStatus: payload.userStatus ?? 1,
    }),
  })
  await throwIfSessionUnauthorized(res)
  const body = (await res.json()) as Envelope<BackendUser>
  if (!res.ok) {
    throw new Error(body?.message || 'No se pudo actualizar el usuario')
  }
  return body.data
}

export async function changeUserPasswordRequest(
  token: string,
  userId: string,
  password: string
): Promise<void> {
  const res = await fetch(`${apiBase}/users/${userId}/password`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ password }),
  })
  await throwIfSessionUnauthorized(res, 'Sesión no válida o cuenta desactivada')
  if (!res.ok) {
    let message = 'No se pudo cambiar la contraseña'
    try {
      const body = (await res.json()) as Envelope<null>
      if (body?.message) message = body.message
    } catch {
      // Ignore non-JSON responses.
    }
    throw new Error(message)
  }
}

export type CatalogRole = {
  roleId: number
  name: string
  description: string
}

export type CatalogPermission = {
  permissionId: number
  code: string
  name: string
  description: string
}

export type RoleWithPermissionsResponse = {
  role: CatalogRole
  permissions: CatalogPermission[]
}

export async function listRolesCatalogRequest(token: string): Promise<CatalogRole[]> {
  const res = await fetch(`${apiBase}/roles`, {
    method: 'GET',
    headers: authHeaders(token),
  })
  await throwIfSessionUnauthorized(res)
  const body = (await res.json()) as Envelope<CatalogRole[]>
  if (!res.ok) {
    throw new Error(body?.message || 'No se pudo cargar roles')
  }
  return body.data
}

export async function listPermissionsCatalogRequest(token: string): Promise<CatalogPermission[]> {
  const res = await fetch(`${apiBase}/roles/permissions`, {
    method: 'GET',
    headers: authHeaders(token),
  })
  await throwIfSessionUnauthorized(res)
  const body = (await res.json()) as Envelope<CatalogPermission[]>
  if (!res.ok) {
    throw new Error(body?.message || 'No se pudo cargar permisos')
  }
  return body.data
}

export async function getRolePermissionsRequest(
  token: string,
  roleId: number
): Promise<RoleWithPermissionsResponse> {
  const res = await fetch(`${apiBase}/roles/${roleId}/permissions`, {
    method: 'GET',
    headers: authHeaders(token),
  })
  await throwIfSessionUnauthorized(res)
  const body = (await res.json()) as Envelope<RoleWithPermissionsResponse>
  if (!res.ok) {
    throw new Error(body?.message || 'No se pudo cargar permisos del rol')
  }
  return body.data
}

export async function updateRolePermissionsRequest(
  token: string,
  roleId: number,
  permissionCodes: string[]
): Promise<RoleWithPermissionsResponse> {
  const res = await fetch(`${apiBase}/roles/${roleId}/permissions`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ permissionCodes }),
  })
  await throwIfSessionUnauthorized(res)
  const body = (await res.json()) as Envelope<RoleWithPermissionsResponse>
  if (!res.ok) {
    throw new Error(body?.message || 'No se pudo guardar permisos del rol')
  }
  return body.data
}

export async function deleteUserRequest(token: string, userId: string): Promise<void> {
  const res = await fetch(`${apiBase}/users/${userId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  await throwIfSessionUnauthorized(res)
  if (!res.ok && res.status !== 204) {
    let message = 'No se pudo eliminar el usuario'
    try {
      const body = (await res.json()) as Envelope<null>
      if (body?.message) message = body.message
    } catch {
      // Ignore non-JSON responses.
    }
    throw new Error(message)
  }
}
