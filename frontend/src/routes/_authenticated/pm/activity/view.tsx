import { createFileRoute } from '@tanstack/react-router'
import { ActivityViewPage } from '@/features/pm/activity/view-page'

export const Route = createFileRoute('/_authenticated/pm/activity/view')({
  component: ActivityViewPage,
})
