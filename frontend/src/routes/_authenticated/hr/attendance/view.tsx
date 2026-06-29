import { createFileRoute } from '@tanstack/react-router'
import { AttendanceViewPage } from '@/features/hr/attendance/view-page'

export const Route = createFileRoute('/_authenticated/hr/attendance/view')({
  component: AttendanceViewPage,
})
