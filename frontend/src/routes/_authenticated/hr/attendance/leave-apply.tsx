import { createFileRoute } from '@tanstack/react-router'
import { LeaveApplyPage } from '@/features/hr/leave/leave-apply-page'

export const Route = createFileRoute('/_authenticated/hr/attendance/leave-apply')({
  component: LeaveApplyPage,
})
