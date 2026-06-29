import { createFileRoute } from '@tanstack/react-router'
import { WorkHistoryPage } from '@/features/hr/personal/history-page'

export const Route = createFileRoute('/_authenticated/hr/personal/history')({
  component: WorkHistoryPage,
})
