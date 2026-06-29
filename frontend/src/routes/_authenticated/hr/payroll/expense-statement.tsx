import { createFileRoute } from '@tanstack/react-router'
import { ExpenseStatementPage } from '@/features/hr/payroll/expense-statement-page'

export const Route = createFileRoute(
  '/_authenticated/hr/payroll/expense-statement'
)({
  component: ExpenseStatementPage,
})
