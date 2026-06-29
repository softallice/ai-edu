import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export type EmployeeRecordType = 'EDUCATION' | 'CAREER' | 'WORK'

export type EmployeeRecord = {
  id: number
  code: string
  employeeId: number
  employeeName: string
  departmentName: string | null
  recordType: EmployeeRecordType
  title: string
  organization: string | null
  startDate: string | null
  endDate: string | null
  description: string | null
  note: string | null
}

export type EmployeeRecordInput = {
  employeeId: number
  recordType: EmployeeRecordType
  title: string
  organization?: string | null
  startDate?: string | null
  endDate?: string | null
  description?: string | null
  note?: string | null
}

export type EmployeeResponse = {
  id: number
  employeeNo: string
  name: string
  active: boolean
}

export const RECORD_TYPE: Record<EmployeeRecordType, string> = {
  EDUCATION: '학력',
  CAREER: '경력',
  WORK: '업무이력',
}

/** 학력/경력 유형 */
export const PERSONAL_TYPES: EmployeeRecordType[] = ['EDUCATION', 'CAREER']
/** 업무이력 유형 */
export const WORK_TYPES: EmployeeRecordType[] = ['WORK']

const BASE = '/api/hr/employee-records'
const queryKey = ['hr', 'employee-records'] as const
const EMP_BASE = '/api/hr/employees'
const empKey = ['hr', 'employees-personal'] as const

export function useEmployeeRecords(query: {
  keyword?: string
  recordType?: EmployeeRecordType
  employeeId?: number
  dateFrom?: string
  dateTo?: string
}) {
  return useQuery({
    queryKey: [...queryKey, query],
    queryFn: async () => {
      const params: Record<string, string | number> = {}
      if (query.keyword) params.keyword = query.keyword
      if (query.recordType) params.recordType = query.recordType
      if (query.employeeId) params.employeeId = query.employeeId
      if (query.dateFrom) params.dateFrom = query.dateFrom
      if (query.dateTo) params.dateTo = query.dateTo
      return (await apiClient.get<EmployeeRecord[]>(BASE, { params })).data
    },
  })
}

export function useSaveEmployeeRecord() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id?: number
      body: EmployeeRecordInput
    }) =>
      id
        ? (await apiClient.put<EmployeeRecord>(`${BASE}/${id}`, body)).data
        : (await apiClient.post<EmployeeRecord>(BASE, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  })
}

export function useDeleteEmployeeRecord() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`${BASE}/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  })
}

/** 직원 목록 훅 (드롭다운용). */
export function useEmployees() {
  return useQuery({
    queryKey: empKey,
    queryFn: async () =>
      (await apiClient.get<EmployeeResponse[]>(EMP_BASE)).data,
  })
}
