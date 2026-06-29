import { createFileRoute } from '@tanstack/react-router'
import { VendorPaymentStatusPage } from '@/features/purchase/payment/status-page'

export const Route = createFileRoute('/_authenticated/purchase/payment/status')(
  {
    component: VendorPaymentStatusPage,
  }
)
