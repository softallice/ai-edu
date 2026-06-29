import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export type EducationType = 'EXTERNAL' | 'CERT'

export type EducationStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'COMPLETED'
  | 'CANCELED'

export type EducationRequest = {
  id: number
  code: string
  employeeId: number
  employeeName: string
  departmentName: string | null
  eduType: EducationType
  title: string
  institution: string | null
  startDate: string | null
  endDate: string | null
  cost: number
  status: EducationStatus
  result: string | null
  note: string | null
}

export type EducationRequestInput = {
  employeeId: number
  eduType: EducationType
  title: string
  institution?: string | null
  startDate?: string | null
  endDate?: string | null
  cost?: number | null
  status: EducationStatus
  result?: string | null
  note?: string | null
}

export type EducationRequestQuery = {
  keyword?: string
  eduType?: EducationType
  status?: EducationStatus
  employeeId?: number
  dateFrom?: string
  dateTo?: string
}

export type EmployeeResponse = {
  id: number
  employeeNo: string
  name: string
  active: boolean
}

export const EDU_TYPE: Record<EducationType, string> = {
  EXTERNAL: '사외교육',
  CERT: '비즈니스자격',
}

export const EDU_STATUS: Record<EducationStatus, string> = {
  REQUESTED: '신청',
  APPROVED: '승인',
  COMPLETED: '완료',
  CANCELED: '취소',
}

export function won(amount: number): string {
  return amount.toLocaleString('ko-KR')
}

const BASE = '/api/hr/education-requests'
const key = ['hr', 'education-requests'] as const
const EMP_BASE = '/api/hr/employees'
const empKey = ['hr', 'employees-edu'] as const

export function useEducationRequests(query: EducationRequestQuery) {
  return useQuery({
    queryKey: [...key, query],
    queryFn: async () => {
      const params: Record<string, string | number> = {}
      if (query.keyword) params.keyword = query.keyword
      if (query.eduType) params.eduType = query.eduType
      if (query.status) params.status = query.status
      if (query.employeeId) params.employeeId = query.employeeId
      if (query.dateFrom) params.dateFrom = query.dateFrom
      if (query.dateTo) params.dateTo = query.dateTo
      return (await apiClient.get<EducationRequest[]>(BASE, { params })).data
    },
  })
}

export function useSaveEducationRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id?: number
      body: EducationRequestInput
    }) =>
      id
        ? (await apiClient.put<EducationRequest>(`${BASE}/${id}`, body)).data
        : (await apiClient.post<EducationRequest>(BASE, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export function useDeleteEducationRequest() {
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
    queryFn: async () =>
      (await apiClient.get<EmployeeResponse[]>(EMP_BASE)).data,
  })
}
