import { ReportsContent } from '@/features/reports/components/reports-content'
import { AuthGuard } from '@/features/auth/components/auth-guard'

export const metadata = {
  title: 'Reportes',
}

export default function ReportsPage() {
  return (
    <AuthGuard requiredModule="reports">
      <ReportsContent />
    </AuthGuard>
  )
}
