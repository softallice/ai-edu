import { createFileRoute } from '@tanstack/react-router'
import { AttendanceRegisterPage } from '@/features/hr/attendance/register-page'

export const Route = createFileRoute('/_authenticated/hr/attendance/register')({
  component: AttendanceRegisterPage,
})
