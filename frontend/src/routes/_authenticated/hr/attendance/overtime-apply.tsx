import { createFileRoute } from '@tanstack/react-router'
import { OvertimeApplyPage } from '@/features/hr/leave/overtime-apply-page'

export const Route = createFileRoute('/_authenticated/hr/attendance/overtime-apply')({
  component: OvertimeApplyPage,
})
