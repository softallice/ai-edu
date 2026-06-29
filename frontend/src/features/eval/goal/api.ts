import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export type EvalGoalStatus = 'DRAFT' | 'CONFIRMED' | 'EVALUATED'

export type EvalGoal = {
  id: number
  code: string
  employeeId: number
  employeeNo: string
  employeeName: string
  period: string
  title: string
  weight: number | null
  targetValue: string | null
  selfScore: number | null
  status: EvalGoalStatus
  note: string | null
}

export type EvalGoalInput = {
  employeeId: number
  period: string
  title: string
  weight?: number | null
  targetValue?: string | null
  selfScore?: number | null
  status: EvalGoalStatus
  note?: string | null
}

export type EvalGoalQuery = {
  keyword?: string
  employeeId?: number
  status?: EvalGoalStatus
  period?: string
}

export type EmployeeItem = {
  id: number
  employeeNo: string
  name: string
}

const BASE = '/api/eval/goals'
const key = ['eval', 'goals'] as const

export function useEvalGoals(query: EvalGoalQuery) {
  return useQuery({
    queryKey: [...key, query],
    queryFn: async () => {
      const params: Record<string, string | number> = {}
      if (query.keyword) params.keyword = query.keyword
      if (query.employeeId) params.employeeId = query.employeeId
      if (query.status) params.status = query.status
      if (query.period) params.period = query.period
      return (await apiClient.get<EvalGoal[]>(BASE, { params })).data
    },
  })
}

export function useSaveEvalGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id?: number; body: EvalGoalInput }) =>
      id
        ? (await apiClient.put<EvalGoal>(`${BASE}/${id}`, body)).data
        : (await apiClient.post<EvalGoal>(BASE, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export function useDeleteEvalGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`${BASE}/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export function useEmployeeList() {
  return useQuery({
    queryKey: ['hr', 'employees'],
    queryFn: async () =>
      (await apiClient.get<EmployeeItem[]>('/api/hr/employees')).data,
  })
}

export const EVAL_GOAL_STATUS: Record<EvalGoalStatus, string> = {
  DRAFT: '작성중',
  CONFIRMED: '확정',
  EVALUATED: '평가완료',
}
