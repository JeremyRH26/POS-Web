'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserRole } from '@/types'
import { ROLE_PERMISSIONS } from '@/config'
import { apiClient } from '@/lib/api-client'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  hasPermission: (module: string) => boolean
}

interface LoginResponse {
  token: string
  tokenType: string
  expiresIn: string
  user: {
    id: string
    email: string
    role: string
  }
}

const allowedRoles: UserRole[] = ['admin', 'manager', 'sales', 'warehouse']

function mapRole(role: string): UserRole {
  return allowedRoles.includes(role as UserRole) ? (role as UserRole) : 'warehouse'
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true })
          const data = await apiClient.post<LoginResponse>('/users/login', {
            email,
            password,
          })

          const role = mapRole(data.user.role)
          const now = new Date()
          set({
            token: data.token,
            user: {
              id: data.user.id,
              email: data.user.email,
              name: data.user.email.split('@')[0],
              role,
              avatar: undefined,
              createdAt: now,
              updatedAt: now,
              permissions: [],
            },
            isAuthenticated: true,
            isLoading: false,
          })

          return true
        } catch {
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
          return false
        }
      },

      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        })
      },

      hasPermission: (module: string) => {
        const { user } = get()
        if (!user) return false
        const permissions = ROLE_PERMISSIONS[user.role as UserRole]
        return permissions.includes(module as (typeof permissions)[number])
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
