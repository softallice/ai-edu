import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export type PayslipStatus = 'DRAFT' | 'CONFIRMED' | 'PAID'

export type Payslip = {
  id: number
  code: string
  employeeId: number
  employeeName: string
  departmentName: string | null
  payMonth: string
  baseSalary: number
  allowance: number
  bonus: number
  deduction: number
  netPay: number
  status: PayslipStatus
  note: string | null
}

export type PayslipInput = {
  employeeId: number
  payMonth: string
  baseSalary?: number | null
  allowance?: number | null
  bonus?: number | null
  deduction?: number | null
  status: PayslipStatus
  note?: string | null
}

export type PayslipQuery = {
  keyword?: string
  status?: PayslipStatus
  employeeId?: number
  payMonthFrom?: string
  payMonthTo?: string
}

export type EmployeeOption = {
  id: number
  employeeNo: string
  name: string
  active: boolean
}

export const PAYSLIP_STATUS: Record<PayslipStatus, string> = {
  DRAFT: '작성',
  CONFIRMED: '확정',
  PAID: '지급완료',
}

export const won = (n: number) => (n ?? 0).toLocaleString('ko-KR')

const BASE = '/api/hr/payslips'
const key = ['hr', 'payslips'] as const
const EMP_BASE = '/api/hr/employees'
const empKey = ['hr', 'employees-payroll'] as const

export function usePayslips(query: PayslipQuery) {
  return useQuery({
    queryKey: [...key, query],
    queryFn: async () => {
      const params: Record<string, string | number> = {}
      if (query.keyword) params.keyword = query.keyword
      if (query.status) params.status = query.status
      if (query.employeeId) params.employeeId = query.employeeId
      if (query.payMonthFrom) params.payMonthFrom = query.payMonthFrom
      if (query.payMonthTo) params.payMonthTo = query.payMonthTo
      return (await apiClient.get<Payslip[]>(BASE, { params })).data
    },
  })
}

export function useSavePayslip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id?: number; body: PayslipInput }) =>
      id
        ? (await apiClient.put<Payslip>(`${BASE}/${id}`, body)).data
        : (await apiClient.post<Payslip>(BASE, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export function useDeletePayslip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`${BASE}/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export function useEmployees() {
  return useQuery({
    queryKey: empKey,
    queryFn: async () => (await apiClient.get<EmployeeOption[]>(EMP_BASE)).data,
  })
}
