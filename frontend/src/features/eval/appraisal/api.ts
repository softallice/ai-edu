import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export type AppraisalStatus = 'SELF' | 'FIRST' | 'SECOND' | 'CONFIRMED'

export type Appraisal = {
  id: number
  code: string
  employeeId: number
  employeeName: string
  departmentName: string | null
  evalGoalId: number | null
  evalGoalTitle: string | null
  period: string
  selfScore: number | null
  firstScore: number | null
  secondScore: number | null
  grade: string | null
  status: AppraisalStatus
  comment: string | null
}

export type AppraisalInput = {
  employeeId: number
  evalGoalId?: number | null
  period: string
  selfScore?: number | null
  firstScore?: number | null
  secondScore?: number | null
  grade?: string | null
  status: AppraisalStatus
  comment?: string | null
}

export type AppraisalQuery = {
  keyword?: string
  status?: AppraisalStatus
  employeeId?: number
  period?: string
}

export type EmployeeItem = {
  id: number
  employeeNo: string
  name: string
}

export const APPRAISAL_STATUS: Record<AppraisalStatus, string> = {
  SELF: '본인평가',
  FIRST: '1차평가',
  SECOND: '2차평가',
  CONFIRMED: '확정',
}

const BASE = '/api/eval/appraisals'
const key = ['eval', 'appraisals'] as const

export function useAppraisals(query: AppraisalQuery) {
  return useQuery({
    queryKey: [...key, query],
    queryFn: async () => {
      const params: Record<string, string | number> = {}
      if (query.keyword) params.keyword = query.keyword
      if (query.status) params.status = query.status
      if (query.employeeId) params.employeeId = query.employeeId
      if (query.period) params.period = query.period
      return (await apiClient.get<Appraisal[]>(BASE, { params })).data
    },
  })
}

export function useSaveAppraisal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id?: number; body: AppraisalInput }) =>
      id
        ? (await apiClient.put<Appraisal>(`${BASE}/${id}`, body)).data
        : (await apiClient.post<Appraisal>(BASE, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export function useDeleteAppraisal() {
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
    queryKey: ['hr', 'employees'],
    queryFn: async () =>
      (await apiClient.get<EmployeeItem[]>('/api/hr/employees')).data,
  })
}
