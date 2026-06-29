import { createFileRoute } from '@tanstack/react-router'
import { CardUsagePage } from '@/features/finance/card/usage-page'

export const Route = createFileRoute('/_authenticated/finance/card/usage')({
  component: CardUsagePage,
})
