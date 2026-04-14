'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { Spinner } from '@/components/ui/spinner'

interface AuthGuardProps {
  children: React.ReactNode
  requiredModule?: string
}

export function AuthGuard({ children, requiredModule }: AuthGuardProps) {
  const router = useRouter()
  const { isAuthenticated, hasPermission } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      router.push('/')
      return
    }

    // Check module permission if required
    if (requiredModule && !hasPermission(requiredModule)) {
      router.push('/dashboard')
      return
    }

    setIsChecking(false)
  }, [isAuthenticated, hasPermission, requiredModule, router])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="w-8 h-8" />
          <p className="text-muted-foreground text-sm">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
