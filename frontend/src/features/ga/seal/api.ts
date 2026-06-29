import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export type SealType =
  | 'USE'
  | 'CORPORATE'
  | 'USE_EXPORT'
  | 'FINGERPRINT_EXPORT'
  | 'E_CONTRACT'
export type SealStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'COMPLETED'

export type SealRequest = {
  id: number
  code: string
  employeeId: number
  employeeName: string
  sealType: SealType
  title: string
  purpose: string | null
  useDate: string | null
  status: SealStatus
}

export type SealRequestInput = {
  employeeId: number
  sealType: SealType
  title: string
  purpose?: string | null
  useDate?: string | null
  status: SealStatus
}

export type SealRequestQuery = {
  keyword?: string
  employeeId?: number
  sealType?: SealType
  status?: SealStatus
  dateFrom?: string
  dateTo?: string
}

export type EmployeeItem = {
  id: number
  name: string
  employeeNo: string
}

const BASE = '/api/ga/seal-requests'
const key = ['ga', 'seal-requests'] as const

const EMP_BASE = '/api/hr/employees'
const empKey = ['hr', 'employees'] as const

export function useSealRequests(query: SealRequestQuery) {
  return useQuery({
    queryKey: [...key, query],
    queryFn: async () => {
      const params: Record<string, string | number> = {}
      if (query.keyword) params.keyword = query.keyword
      if (query.employeeId) params.employeeId = query.employeeId
      if (query.sealType) params.sealType = query.sealType
      if (query.status) params.status = query.status
      if (query.dateFrom) params.dateFrom = query.dateFrom
      if (query.dateTo) params.dateTo = query.dateTo
      return (await apiClient.get<SealRequest[]>(BASE, { params })).data
    },
  })
}

export function useSaveSealRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id?: number
      body: SealRequestInput
    }) =>
      id
        ? (await apiClient.put<SealRequest>(`${BASE}/${id}`, body)).data
        : (await apiClient.post<SealRequest>(BASE, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export function useDeleteSealRequest() {
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

export const SEAL_TYPE: Record<SealType, string> = {
  USE: '사용인감',
  CORPORATE: '법인인감',
  USE_EXPORT: '사용인감반출',
  FINGERPRINT_EXPORT: '지문인식기반출',
  E_CONTRACT: '전자계약',
}

export const SEAL_STATUS: Record<SealStatus, string> = {
  REQUESTED: '신청',
  APPROVED: '승인',
  REJECTED: '반려',
  COMPLETED: '완료',
}
