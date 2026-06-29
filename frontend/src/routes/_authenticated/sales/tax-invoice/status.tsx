import { createFileRoute } from '@tanstack/react-router'
import { TaxInvoiceStatusPage } from '@/features/sales/tax-invoice/status-page'

export const Route = createFileRoute(
  '/_authenticated/sales/tax-invoice/status'
)({
  component: TaxInvoiceStatusPage,
})
