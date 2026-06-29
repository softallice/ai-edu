import { createFileRoute } from '@tanstack/react-router'
import { EmployeesPage } from '@/features/hr/employees-page'

export const Route = createFileRoute('/_authenticated/hr/employees/')({
  component: EmployeesPage,
})
