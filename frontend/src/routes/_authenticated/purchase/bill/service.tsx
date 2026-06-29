import { createFileRoute } from '@tanstack/react-router'
import { VendorBillServicePage } from '@/features/purchase/vendor-bill/service-page'

export const Route = createFileRoute('/_authenticated/purchase/bill/service')({
  component: VendorBillServicePage,
})
