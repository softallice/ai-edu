import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export type VendorBillStatus = 'DRAFT' | 'CONFIRMED' | 'PAID'
export type VendorBillType = 'GOODS' | 'SERVICE'

export type VendorBill = {
  id: number
  code: string
  supplierId: number
  supplierName: string
  purchaseOrderId: number | null
  purchaseOrderCode: string | null
  billType: VendorBillType
  issueDate: string | null
  supplyAmount: number
  taxAmount: number
  totalAmount: number
  status: VendorBillStatus
  note: string | null
}

export type VendorBillInput = {
  supplierId: number
  purchaseOrderId?: number | null
  billType: VendorBillType
  issueDate?: string | null
  supplyAmount: number
  taxAmount?: number | null
  status: VendorBillStatus
  note?: string | null
}

export type VendorBillQuery = {
  keyword?: string
  status?: VendorBillStatus
  supplierId?: number
  billType?: VendorBillType
  dateFrom?: string
  dateTo?: string
}

type PurchaseOrderSummary = {
  id: number
  code: string
  supplierName: string
}

const BASE = '/api/purchase/vendor-bills'
const key = ['purchase', 'vendor-bills'] as const

export function useVendorBills(query: VendorBillQuery) {
  return useQuery({
    queryKey: [...key, query],
    queryFn: async () => {
      const params: Record<string, string | number> = {}
      if (query.keyword) params.keyword = query.keyword
      if (query.status) params.status = query.status
      if (query.supplierId) params.supplierId = query.supplierId
      if (query.billType) params.billType = query.billType
      if (query.dateFrom) params.dateFrom = query.dateFrom
      if (query.dateTo) params.dateTo = query.dateTo
      return (await apiClient.get<VendorBill[]>(BASE, { params })).data
    },
  })
}

export function useSaveVendorBill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id?: number; body: VendorBillInput }) =>
      id
        ? (await apiClient.put<VendorBill>(`${BASE}/${id}`, body)).data
        : (await apiClient.post<VendorBill>(BASE, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export function useDeleteVendorBill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`${BASE}/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export function usePurchaseOrdersForBill() {
  return useQuery({
    queryKey: ['purchase', 'orders-summary'],
    queryFn: async () =>
      (await apiClient.get<PurchaseOrderSummary[]>('/api/purchase/orders'))
        .data,
  })
}

export const VENDOR_BILL_STATUS: Record<VendorBillStatus, string> = {
  DRAFT: '초안',
  CONFIRMED: '확정',
  PAID: '지급완료',
}

export const VENDOR_BILL_TYPE: Record<VendorBillType, string> = {
  GOODS: '상품매입',
  SERVICE: '용역매입',
}

export const won = (n: number) => (n ?? 0).toLocaleString('ko-KR')
