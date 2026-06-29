import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export type ExpenseType =
  | 'DISBURSEMENT'
  | 'CONGRATULATION'
  | 'TUITION'
  | 'TRANSPORT'
  | 'MEAL'
export type ExpenseStatus = 'REQUESTED' | 'APPROVED' | 'PAID' | 'REJECTED'

export type ExpenseRequest = {
  id: number
  code: string
  employeeId: number
  employeeName: string
  expenseType: ExpenseType
  title: string
  amount: number
  requestDate: string | null
  reason: string | null
  status: ExpenseStatus
}

export type ExpenseRequestInput = {
  employeeId: number
  expenseType: ExpenseType
  title: string
  amount: number
  requestDate?: string | null
  reason?: string | null
  status: ExpenseStatus
}

export type ExpenseRequestQuery = {
  keyword?: string
  employeeId?: number
  expenseType?: ExpenseType
  status?: ExpenseStatus
  dateFrom?: string
  dateTo?: string
}

export type EmployeeItem = {
  id: number
  name: string
  employeeNo: string
}

const BASE = '/api/ga/expense-requests'
const key = ['ga', 'expense-requests'] as const

const EMP_BASE = '/api/hr/employees'
const empKey = ['hr', 'employees'] as const

export function useExpenseRequests(query: ExpenseRequestQuery) {
  return useQuery({
    queryKey: [...key, query],
    queryFn: async () => {
      const params: Record<string, string | number> = {}
      if (query.keyword) params.keyword = query.keyword
      if (query.employeeId) params.employeeId = query.employeeId
      if (query.expenseType) params.expenseType = query.expenseType
      if (query.status) params.status = query.status
      if (query.dateFrom) params.dateFrom = query.dateFrom
      if (query.dateTo) params.dateTo = query.dateTo
      return (await apiClient.get<ExpenseRequest[]>(BASE, { params })).data
    },
  })
}

export function useSaveExpenseRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id?: number
      body: ExpenseRequestInput
    }) =>
      id
        ? (await apiClient.put<ExpenseRequest>(`${BASE}/${id}`, body)).data
        : (await apiClient.post<ExpenseRequest>(BASE, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export function useDeleteExpenseRequest() {
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
    queryFn: async () => (await apiClient.get<EmployeeItem[]>(EMP_BASE)).data,
  })
}

export const EXPENSE_TYPE: Record<ExpenseType, string> = {
  DISBURSEMENT: '지출',
  CONGRATULATION: '경조사',
  TUITION: '교육비',
  TRANSPORT: '교통비',
  MEAL: '식대',
}

export const EXPENSE_STATUS: Record<ExpenseStatus, string> = {
  REQUESTED: '신청',
  APPROVED: '승인',
  PAID: '지급',
  REJECTED: '반려',
}

export const won = (n: number) => (n ?? 0).toLocaleString('ko-KR')
