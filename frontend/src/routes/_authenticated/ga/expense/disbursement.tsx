import { createFileRoute } from '@tanstack/react-router'
import { ExpenseDisbursementPage } from '@/features/ga/expense/disbursement-page'

export const Route = createFileRoute('/_authenticated/ga/expense/disbursement')(
  {
    component: ExpenseDisbursementPage,
  }
)
