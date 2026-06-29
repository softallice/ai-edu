import { createFileRoute } from '@tanstack/react-router'
import { TransportPage } from '@/features/ga/expense/transport-page'

export const Route = createFileRoute('/_authenticated/ga/expense/transport')({
  component: TransportPage,
})
