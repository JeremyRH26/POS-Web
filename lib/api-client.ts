type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface ApiEnvelope<T> {
  status: number
  message: string
  data: T
}

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data: unknown = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

interface RequestOptions extends Omit<RequestInit, 'method' | 'body'> {
  method?: HttpMethod
  token?: string | null
  body?: unknown
}

const DEFAULT_API_URL = 'http://localhost:4000/api'

function resolveApiUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/+$/, '')
}

function buildHeaders(token?: string | null, headers?: HeadersInit) {
  const merged = new Headers(headers)

  if (!merged.has('Content-Type')) {
    merged.set('Content-Type', 'application/json')
  }

  if (token) {
    merged.set('Authorization', `Bearer ${token}`)
  }

  return merged
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', token = null, headers, body, ...rest } = options

  const response = await fetch(`${resolveApiUrl()}${path}`, {
    method,
    headers: buildHeaders(token, headers),
    body: body === undefined ? undefined : JSON.stringify(body),
    ...rest,
  })

  const text = await response.text()
  const parsed = text ? (JSON.parse(text) as ApiEnvelope<T>) : null

  if (!response.ok) {
    throw new ApiError(
      parsed?.message || `HTTP ${response.status}`,
      response.status,
      parsed?.data ?? null
    )
  }

  return parsed?.data as T
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'DELETE' }),
}
