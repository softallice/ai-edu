import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export type PurchaseOrderStatus = 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'CLOSED'

export type PurchaseOrder = {
  id: number
  code: string
  supplierId: number
  supplierName: string
  projectId: number | null
  projectName: string | null
  orderDate: string | null
  deliveryDate: string | null
  amount: number
  status: PurchaseOrderStatus
  note: string | null
}

export type PurchaseOrderInput = {
  supplierId: number
  projectId?: number | null
  orderDate?: string | null
  deliveryDate?: string | null
  amount: number
  status: PurchaseOrderStatus
  note?: string | null
}

export type PurchaseOrderQuery = {
  keyword?: string
  status?: PurchaseOrderStatus
  supplierId?: number
  dateFrom?: string
  dateTo?: string
}

type ProjectSummary = {
  id: number
  code: string
  name: string
}

const BASE = '/api/purchase/orders'
const key = ['purchase', 'orders'] as const

export function usePurchaseOrders(query: PurchaseOrderQuery) {
  return useQuery({
    queryKey: [...key, query],
    queryFn: async () => {
      const params: Record<string, string | number> = {}
      if (query.keyword) params.keyword = query.keyword
      if (query.status) params.status = query.status
      if (query.supplierId) params.supplierId = query.supplierId
      if (query.dateFrom) params.dateFrom = query.dateFrom
      if (query.dateTo) params.dateTo = query.dateTo
      return (await apiClient.get<PurchaseOrder[]>(BASE, { params })).data
    },
  })
}

export function useSavePurchaseOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id?: number
      body: PurchaseOrderInput
    }) =>
      id
        ? (await apiClient.put<PurchaseOrder>(`${BASE}/${id}`, body)).data
        : (await apiClient.post<PurchaseOrder>(BASE, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export function useDeletePurchaseOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`${BASE}/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export function useProjects() {
  return useQuery({
    queryKey: ['pm', 'projects'],
    queryFn: async () =>
      (await apiClient.get<ProjectSummary[]>('/api/pm/projects')).data,
  })
}

export const PURCHASE_ORDER_STATUS: Record<PurchaseOrderStatus, string> = {
  DRAFT: '초안',
  ORDERED: '발주',
  RECEIVED: '입고',
  CLOSED: '마감',
}

export const won = (n: number) => (n ?? 0).toLocaleString('ko-KR')
