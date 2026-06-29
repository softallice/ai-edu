import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export type CollectionMethod = 'TRANSFER' | 'CARD' | 'CHECK' | 'CASH'
export type CollectionStatus = 'PLANNED' | 'COLLECTED' | 'OVERDUE'

export type ProjectCollection = {
  id: number
  code: string
  customerId: number
  customerName: string
  contractId: number | null
  contractCode: string | null
  projectId: number | null
  projectName: string | null
  plannedDate: string | null
  collectDate: string | null
  amount: number
  method: CollectionMethod
  status: CollectionStatus
  note: string | null
}

export type ProjectCollectionInput = {
  customerId: number
  contractId?: number | null
  projectId?: number | null
  plannedDate?: string | null
  collectDate?: string | null
  amount: number
  method: CollectionMethod
  status: CollectionStatus
  note?: string | null
}

export type ProjectCollectionQuery = {
  keyword?: string
  status?: CollectionStatus
  customerId?: number
  dateFrom?: string
  dateTo?: string
}

const BASE = '/api/sales/collections'
const key = ['sales', 'collections'] as const

export function useCollections(query: ProjectCollectionQuery) {
  return useQuery({
    queryKey: [...key, query],
    queryFn: async () => {
      const params: Record<string, string | number> = {}
      if (query.keyword) params.keyword = query.keyword
      if (query.status) params.status = query.status
      if (query.customerId) params.customerId = query.customerId
      if (query.dateFrom) params.dateFrom = query.dateFrom
      if (query.dateTo) params.dateTo = query.dateTo
      return (await apiClient.get<ProjectCollection[]>(BASE, { params })).data
    },
  })
}

export function useSaveCollection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id?: number
      body: ProjectCollectionInput
    }) =>
      id
        ? (await apiClient.put<ProjectCollection>(`${BASE}/${id}`, body)).data
        : (await apiClient.post<ProjectCollection>(BASE, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export function useDeleteCollection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`${BASE}/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export const COLLECTION_METHOD: Record<CollectionMethod, string> = {
  TRANSFER: '계좌이체',
  CARD: '카드',
  CHECK: '수표',
  CASH: '현금',
}

export const COLLECTION_STATUS: Record<CollectionStatus, string> = {
  PLANNED: '예정',
  COLLECTED: '수금',
  OVERDUE: '연체',
}

export const won = (n: number) => (n ?? 0).toLocaleString('ko-KR')
