import { createFileRoute } from '@tanstack/react-router'
import { AccountsPage } from '@/features/accounting/accounts-page'

export const Route = createFileRoute('/_authenticated/accounting/accounts')({
  component: AccountsPage,
})
