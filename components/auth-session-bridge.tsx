'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { registerUnauthorizedCallback } from '@/lib/unauthorized-bridge'
import { validateSessionRequest } from '@/lib/api'

const POLL_MS = 45_000

/** Registra cierre de sesión ante 401 y comprueba periódicamente la sesión para detectar usuario desactivado sin navegar. */
export function AuthSessionBridge() {
  const logout = useAuthStore((s) => s.logout)
  const token = useAuthStore((s) => s.token)
  const refreshToken = useAuthStore((s) => s.refreshToken)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    registerUnauthorizedCallback(() => logout())
    return () => registerUnauthorizedCallback(null)
  }, [logout])

  useEffect(() => {
    if (!token || !isAuthenticated) return

    const run = () => {
      void validateSessionRequest(token, {
        refreshToken,
        onTokenRefreshed: (pair) => {
          useAuthStore.setState({
            token: pair.token,
            refreshToken: pair.refreshToken,
          })
        },
      }).catch(() => {
        /* 401 → notifySessionInvalid + logout; otros errores (red) no cierran sesión */
      })
    }

    run()
    const interval = window.setInterval(run, POLL_MS)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') run()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [token, refreshToken, isAuthenticated])

  return null
}
