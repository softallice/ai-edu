import { createFileRoute } from '@tanstack/react-router'
import { DepartmentsPage } from '@/features/hr/departments-page'

export const Route = createFileRoute('/_authenticated/hr/departments/')({
  component: DepartmentsPage,
})
