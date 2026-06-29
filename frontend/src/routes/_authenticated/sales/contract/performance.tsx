import { createFileRoute } from '@tanstack/react-router'
import { ContractPerformancePage } from '@/features/sales/contract/performance-page'

export const Route = createFileRoute(
  '/_authenticated/sales/contract/performance'
)({
  component: ContractPerformancePage,
})
