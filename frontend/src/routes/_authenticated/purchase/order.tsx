import { createFileRoute } from '@tanstack/react-router'
import { PurchaseOrderPage } from '@/features/purchase/order/order-page'

export const Route = createFileRoute('/_authenticated/purchase/order')({
  component: PurchaseOrderPage,
})
