import { FelContent } from '@/features/fel/components/fel-content'
import { AuthGuard } from '@/features/auth/components/auth-guard'

export const metadata = {
  title: 'FEL - Facturación Electrónica',
}

export default function FelPage() {
  return (
    <AuthGuard requiredModule="fel">
      <FelContent />
    </AuthGuard>
  )
}
