import { createFileRoute } from '@tanstack/react-router'
import { EduHistoryPage } from '@/features/hr/education/history-page'

export const Route = createFileRoute(
  '/_authenticated/hr/education/history'
)({
  component: EduHistoryPage,
})
