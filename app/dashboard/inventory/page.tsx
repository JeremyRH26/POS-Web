import { InventoryContent } from '@/features/inventory/components/inventory-content'
import { AuthGuard } from '@/features/auth/components/auth-guard'

export const metadata = {
  title: 'Inventario',
}

export default function InventoryPage() {
  return (
    <AuthGuard requiredModule="inventory">
      <InventoryContent />
    </AuthGuard>
  )
}
