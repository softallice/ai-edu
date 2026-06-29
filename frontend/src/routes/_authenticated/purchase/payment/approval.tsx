import { createFileRoute } from '@tanstack/react-router'
import { VendorPaymentApprovalPage } from '@/features/purchase/payment/approval-page'

export const Route = createFileRoute(
  '/_authenticated/purchase/payment/approval'
)({
  component: VendorPaymentApprovalPage,
})
