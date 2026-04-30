const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const cleanApiUrl = rawApiUrl.replace(/\/$/, '')
const apiBase = cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`

type Envelope<T> = {
  status: number
  message: string
  data: T
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

export async function listUsersRequest(token: string): Promise<BackendUser[]> {
  const res = await fetch(`${apiBase}/users?includeInactive=1`, {
    method: 'GET',
    headers: authHeaders(token),
  })
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
  const body = (await res.json()) as Envelope<BackendUser>
  if (!res.ok) {
    throw new Error(body?.message || 'No se pudo actualizar el usuario')
  }
  return body.data
}

export async function deleteUserRequest(token: string, userId: string): Promise<void> {
  const res = await fetch(`${apiBase}/users/${userId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
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
