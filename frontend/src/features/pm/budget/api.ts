import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export type BudgetType = 'TEAM' | 'PROJECT'

export type Budget = {
  id: number
  code: string
  budgetType: BudgetType
  departmentId: number | null
  departmentName: string | null
  projectId: number | null
  projectName: string | null
  fiscalYear: number
  category: string
  plannedAmount: number
  actualAmount: number
  note: string | null
}

export type BudgetInput = {
  budgetType: BudgetType
  departmentId?: number | null
  projectId?: number | null
  fiscalYear: number
  category: string
  plannedAmount: number
  actualAmount?: number | null
  note?: string | null
}

export type BudgetQuery = {
  keyword?: string
  budgetType?: BudgetType
  departmentId?: number
  projectId?: number
  fiscalYear?: number
}

export type Department = {
  id: number
  code: string
  name: string
}

export type Project = {
  id: number
  code: string
  name: string
}

const BASE = '/api/pm/budgets'
const key = ['pm', 'budgets'] as const

export function useBudgets(query: BudgetQuery) {
  return useQuery({
    queryKey: [...key, query],
    queryFn: async () => {
      const params: Record<string, string | number> = {}
      if (query.keyword) params.keyword = query.keyword
      if (query.budgetType) params.budgetType = query.budgetType
      if (query.departmentId) params.departmentId = query.departmentId
      if (query.projectId) params.projectId = query.projectId
      if (query.fiscalYear) params.fiscalYear = query.fiscalYear
      return (await apiClient.get<Budget[]>(BASE, { params })).data
    },
  })
}

export function useSaveBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id?: number; body: BudgetInput }) =>
      id
        ? (await apiClient.put<Budget>(`${BASE}/${id}`, body)).data
        : (await apiClient.post<Budget>(BASE, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export function useDeleteBudget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`${BASE}/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export function useDepartments() {
  return useQuery({
    queryKey: ['hr', 'departments'],
    queryFn: async () =>
      (await apiClient.get<Department[]>('/api/hr/departments')).data,
  })
}

export function useProjects() {
  return useQuery({
    queryKey: ['pm', 'projects'],
    queryFn: async () =>
      (await apiClient.get<Project[]>('/api/pm/projects')).data,
  })
}

export const BUDGET_TYPE: Record<BudgetType, string> = {
  TEAM: '팀',
  PROJECT: '프로젝트',
}

export const won = (n: number) => (n ?? 0).toLocaleString('ko-KR')
