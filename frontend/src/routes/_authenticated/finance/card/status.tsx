import { createFileRoute } from '@tanstack/react-router'
import { CardStatusPage } from '@/features/finance/card/status-page'

export const Route = createFileRoute('/_authenticated/finance/card/status')({
  component: CardStatusPage,
})
