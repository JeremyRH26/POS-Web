'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserRole } from '@/types'
import { ROLE_PERMISSIONS } from '@/config'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  hasPermission: (module: string) => boolean
}

// Mock users for demonstration
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'admin@exponencial.com': {
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@exponencial.com',
      name: 'Administrador',
      role: 'admin',
      avatar: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: [],
    },
  },
  'manager@exponencial.com': {
    password: 'manager123',
    user: {
      id: '2',
      email: 'manager@exponencial.com',
      name: 'Gerente de Ventas',
      role: 'manager',
      avatar: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: [],
    },
  },
  'sales@exponencial.com': {
    password: 'sales123',
    user: {
      id: '3',
      email: 'sales@exponencial.com',
      name: 'Vendedor',
      role: 'sales',
      avatar: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: [],
    },
  },
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockUser = MOCK_USERS[email.toLowerCase()]
        if (mockUser && mockUser.password === password) {
          set({
            user: mockUser.user,
            isAuthenticated: true,
            isLoading: false,
          })
          return true
        }

        set({ isLoading: false })
        return false
      },

      logout: () => {
        set({
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
