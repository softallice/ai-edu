import { createFileRoute } from '@tanstack/react-router'
import { PurchaseRequestPage } from '@/features/sales/purchase-request/request-page'

export const Route = createFileRoute('/_authenticated/sales/purchase-request')({
  component: PurchaseRequestPage,
})
