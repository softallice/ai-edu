import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export type Department = {
  id: number
  code: string
  name: string
  sequence: number
  active: boolean
  parentId: number | null
  parentName: string | null
}
export type DepartmentInput = {
  code: string
  name: string
  sequence?: number
  active?: boolean
  parentId?: number | null
}

export type Employee = {
  id: number
  employeeNo: string
  name: string
  active: boolean
  departmentId: number | null
  departmentName: string | null
  position: string
  employmentType: string
  hireDate: string | null
  departureDate: string | null
  costRate: number
  workEmail: string | null
  workPhone: string | null
  mobile: string | null
  gender: string | null
  birthday: string | null
}
export type EmployeeInput = {
  employeeNo: string
  name: string
  active?: boolean
  departmentId?: number | null
  position: string
  employmentType: string
  hireDate?: string | null
  workEmail?: string | null
  mobile?: string | null
}

const deptKey = ['hr', 'departments'] as const
const empKey = ['hr', 'employees'] as const

export function useDepartments() {
  return useQuery({
    queryKey: deptKey,
    queryFn: async () => (await apiClient.get<Department[]>('/api/hr/departments')).data,
  })
}
export function useSaveDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id?: number; body: DepartmentInput }) =>
      id
        ? (await apiClient.put<Department>(`/api/hr/departments/${id}`, body)).data
        : (await apiClient.post<Department>('/api/hr/departments', body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: deptKey }),
  })
}
export function useDeleteDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/api/hr/departments/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: deptKey }),
  })
}

export function useEmployees(keyword?: string, departmentId?: number) {
  return useQuery({
    queryKey: [...empKey, { keyword: keyword ?? '', departmentId: departmentId ?? 0 }],
    queryFn: async () => {
      const params: Record<string, string | number> = {}
      if (keyword) params.keyword = keyword
      if (departmentId) params.departmentId = departmentId
      return (await apiClient.get<Employee[]>('/api/hr/employees', { params })).data
    },
  })
}
export function useSaveEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id?: number; body: EmployeeInput }) =>
      id
        ? (await apiClient.put<Employee>(`/api/hr/employees/${id}`, body)).data
        : (await apiClient.post<Employee>('/api/hr/employees', body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: empKey }),
  })
}
export function useDeleteEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/api/hr/employees/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: empKey }),
  })
}

export const POSITIONS: Record<string, string> = {
  STAFF: '사원',
  ASSISTANT_MANAGER: '대리',
  MANAGER: '과장',
  DEPUTY_GM: '차장',
  GENERAL_MANAGER: '부장',
  DIRECTOR: '이사',
  EXECUTIVE: '임원',
  CEO: '대표',
}
export const EMPLOYMENT_TYPES: Record<string, string> = {
  REGULAR: '정규직',
  CONTRACT: '계약직',
  DISPATCH: '파견',
  INTERN: '인턴',
  PARTTIME: '시간제',
}
