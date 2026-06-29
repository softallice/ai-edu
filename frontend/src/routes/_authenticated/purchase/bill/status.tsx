import { createFileRoute } from '@tanstack/react-router'
import { VendorBillStatusPage } from '@/features/purchase/vendor-bill/status-page'

export const Route = createFileRoute('/_authenticated/purchase/bill/status')({
  component: VendorBillStatusPage,
})
