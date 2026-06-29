import { createFileRoute } from '@tanstack/react-router'
import { TaxInvoiceIssuePage } from '@/features/sales/tax-invoice/issue-page'

export const Route = createFileRoute('/_authenticated/sales/tax-invoice/issue')(
  {
    component: TaxInvoiceIssuePage,
  }
)
