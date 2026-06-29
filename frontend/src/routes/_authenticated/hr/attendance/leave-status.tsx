import { createFileRoute } from '@tanstack/react-router'
import { LeaveStatusPage } from '@/features/hr/leave/leave-status-page'

export const Route = createFileRoute('/_authenticated/hr/attendance/leave-status')({
  component: LeaveStatusPage,
})
