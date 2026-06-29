import { createFileRoute } from '@tanstack/react-router'
import { VehicleSubsidyPage } from '@/features/ga/expense/vehicle-subsidy-page'

export const Route = createFileRoute(
  '/_authenticated/ga/expense/vehicle-subsidy'
)({
  component: VehicleSubsidyPage,
})
