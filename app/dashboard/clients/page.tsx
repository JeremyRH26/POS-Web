import { ClientsContent } from '@/features/clients/components/clients-content'
import { AuthGuard } from '@/features/auth/components/auth-guard'

export const metadata = {
  title: 'Clientes',
}

export default function ClientsPage() {
  return (
    <AuthGuard requiredModule="clients">
      <ClientsContent />
    </AuthGuard>
  )
}
