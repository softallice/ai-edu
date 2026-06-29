import { createFileRoute } from '@tanstack/react-router'
import { IncentiveStatusPage } from '@/features/hr/payroll/incentive-status-page'

export const Route = createFileRoute(
  '/_authenticated/hr/payroll/incentive-status'
)({
  component: IncentiveStatusPage,
})
