import { createFileRoute } from '@tanstack/react-router'
import { CongratulationPage } from '@/features/ga/expense/congratulation-page'

export const Route = createFileRoute(
  '/_authenticated/ga/expense/congratulation'
)({
  component: CongratulationPage,
})
