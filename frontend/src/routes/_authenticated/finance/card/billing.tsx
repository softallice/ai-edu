import { createFileRoute } from '@tanstack/react-router'
import { CardBillingPage } from '@/features/finance/card/billing-page'

export const Route = createFileRoute('/_authenticated/finance/card/billing')({
  component: CardBillingPage,
})
