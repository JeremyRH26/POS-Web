'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { MODULE_PERMISSION_CODES } from '@/config'
import { loginRequest } from '@/lib/api'

interface AuthState {
  user: User | null
  token: string | null
  permissionCodes: string[]
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  hasPermission: (module: string) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      permissionCodes: [],
      isAuthenticated: false,
      isLoading: false,

      login: async (username: string, password: string) => {
        set({ isLoading: true })
        try {
          const data = await loginRequest(username.trim(), password)
          const lowerRole = data.user.roleName.toLowerCase()
          const mappedRole: User['role'] =
            lowerRole.includes('super') || lowerRole.includes('admin')
              ? 'admin'
              : lowerRole.includes('prevendedor')
                ? 'sales'
                : lowerRole.includes('bodega')
                  ? 'warehouse'
                  : 'manager'
          set({
            user: {
              id: data.user.id,
              email: data.user.username,
              name: data.user.fullName,
              role: mappedRole,
              roleName: data.user.roleName,
              avatar: undefined,
              createdAt: new Date(),
              updatedAt: new Date(),
              permissions: [],
            },
            token: data.token,
            permissionCodes: data.user.permissions ?? [],
            isAuthenticated: true,
            isLoading: false,
          })
          return true
        } catch {
          set({ isLoading: false })
          return false
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          permissionCodes: [],
          isAuthenticated: false,
        })
      },

      hasPermission: (module: string) => {
        const { permissionCodes } = get()
        const required = MODULE_PERMISSION_CODES[module as keyof typeof MODULE_PERMISSION_CODES]
        if (!required || required.length === 0) return true
        return required.some((code) => permissionCodes.includes(code))
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
