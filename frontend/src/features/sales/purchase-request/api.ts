import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export type PurchaseRequestStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'ORDERED'
  | 'REJECTED'

export type PurchaseRequest = {
  id: number
  code: string
  projectId: number | null
  projectName: string | null
  requesterId: number | null
  requesterName: string | null
  requestDate: string | null
  itemName: string
  quantity: number | null
  estimatedAmount: number
  status: PurchaseRequestStatus
  note: string | null
}

export type PurchaseRequestInput = {
  projectId?: number | null
  requesterId?: number | null
  requestDate?: string | null
  itemName: string
  quantity?: number | null
  estimatedAmount?: number
  status: PurchaseRequestStatus
  note?: string | null
}

export type PurchaseRequestQuery = {
  keyword?: string
  status?: PurchaseRequestStatus
  dateFrom?: string
  dateTo?: string
}

// 직원 목록용 간소 타입
export type EmployeeSummary = {
  id: number
  employeeNo: string
  name: string
}

// 프로젝트 목록용 간소 타입
export type ProjectSummary = {
  id: number
  code: string
  name: string
}

const BASE = '/api/sales/purchase-requests'
const key = ['sales', 'purchase-requests'] as const

export function usePurchaseRequests(query: PurchaseRequestQuery) {
  return useQuery({
    queryKey: [...key, query],
    queryFn: async () => {
      const params: Record<string, string | number> = {}
      if (query.keyword) params.keyword = query.keyword
      if (query.status) params.status = query.status
      if (query.dateFrom) params.dateFrom = query.dateFrom
      if (query.dateTo) params.dateTo = query.dateTo
      return (await apiClient.get<PurchaseRequest[]>(BASE, { params })).data
    },
  })
}

export function useSavePurchaseRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id?: number
      body: PurchaseRequestInput
    }) =>
      id
        ? (await apiClient.put<PurchaseRequest>(`${BASE}/${id}`, body)).data
        : (await apiClient.post<PurchaseRequest>(BASE, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export function useDeletePurchaseRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`${BASE}/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

// 직원 목록 훅
export function useEmployees() {
  return useQuery({
    queryKey: ['hr', 'employees'],
    queryFn: async () =>
      (await apiClient.get<EmployeeSummary[]>('/api/hr/employees')).data,
  })
}

// 프로젝트 목록 훅
export function useProjects() {
  return useQuery({
    queryKey: ['pm', 'projects'],
    queryFn: async () =>
      (await apiClient.get<ProjectSummary[]>('/api/pm/projects')).data,
  })
}

export const PURCHASE_REQUEST_STATUS: Record<PurchaseRequestStatus, string> = {
  REQUESTED: '요청',
  APPROVED: '승인',
  ORDERED: '발주',
  REJECTED: '반려',
}

export const won = (n: number) => (n ?? 0).toLocaleString('ko-KR')
