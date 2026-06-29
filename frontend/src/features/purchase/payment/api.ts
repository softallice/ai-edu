import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export type VendorPaymentStatus = 'REQUESTED' | 'APPROVED' | 'PAID'
export type PaymentMethod = 'TRANSFER' | 'CARD' | 'CASH' | 'NOTE'

export type VendorPayment = {
  id: number
  code: string
  supplierId: number
  supplierName: string
  purchaseOrderId: number | null
  purchaseOrderCode: string | null
  paymentDate: string | null
  amount: number
  method: PaymentMethod
  status: VendorPaymentStatus
  note: string | null
}

export type VendorPaymentInput = {
  supplierId: number
  purchaseOrderId?: number | null
  paymentDate?: string | null
  amount: number
  method: PaymentMethod
  status: VendorPaymentStatus
  note?: string | null
}

export type VendorPaymentQuery = {
  keyword?: string
  status?: VendorPaymentStatus
  supplierId?: number
  dateFrom?: string
  dateTo?: string
}

type PurchaseOrderSummary = {
  id: number
  code: string
  supplierName: string
}

const BASE = '/api/purchase/vendor-payments'
const key = ['purchase', 'vendor-payments'] as const

export function useVendorPayments(query: VendorPaymentQuery) {
  return useQuery({
    queryKey: [...key, query],
    queryFn: async () => {
      const params: Record<string, string | number> = {}
      if (query.keyword) params.keyword = query.keyword
      if (query.status) params.status = query.status
      if (query.supplierId) params.supplierId = query.supplierId
      if (query.dateFrom) params.dateFrom = query.dateFrom
      if (query.dateTo) params.dateTo = query.dateTo
      return (await apiClient.get<VendorPayment[]>(BASE, { params })).data
    },
  })
}

export function useSaveVendorPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id?: number
      body: VendorPaymentInput
    }) =>
      id
        ? (await apiClient.put<VendorPayment>(`${BASE}/${id}`, body)).data
        : (await apiClient.post<VendorPayment>(BASE, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export function useDeleteVendorPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`${BASE}/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export function usePurchaseOrders() {
  return useQuery({
    queryKey: ['purchase', 'orders-summary'],
    queryFn: async () =>
      (await apiClient.get<PurchaseOrderSummary[]>('/api/purchase/orders'))
        .data,
  })
}

export const VENDOR_PAYMENT_STATUS: Record<VendorPaymentStatus, string> = {
  REQUESTED: '결재요청',
  APPROVED: '승인',
  PAID: '지급완료',
}

export const PAYMENT_METHOD: Record<PaymentMethod, string> = {
  TRANSFER: '계좌이체',
  CARD: '카드',
  CASH: '현금',
  NOTE: '어음',
}

export const won = (n: number) => (n ?? 0).toLocaleString('ko-KR')
