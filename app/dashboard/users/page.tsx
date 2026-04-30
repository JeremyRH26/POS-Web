import { UsersContent } from '@/features/users/components/users-content'
import { AuthGuard } from '@/features/auth/components/auth-guard'

export const metadata = {
  title: 'Usuarios',
}

export default function UsersPage() {
  return (
    <AuthGuard requiredModule="users">
      <UsersContent />
    </AuthGuard>
  )
}
