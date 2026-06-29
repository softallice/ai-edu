import { createFileRoute } from '@tanstack/react-router'
import { PayslipPage } from '@/features/hr/payroll/payslip-page'

export const Route = createFileRoute('/_authenticated/hr/payroll/payslip')({
  component: PayslipPage,
})
