import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export type TaxInvoiceStatus = 'DRAFT' | 'ISSUED' | 'SENT'

export type TaxInvoice = {
  id: number
  code: string
  customerId: number
  customerName: string
  contractId: number | null
  contractCode: string | null
  issueDate: string | null
  supplyAmount: number
  taxAmount: number
  totalAmount: number
  status: TaxInvoiceStatus
  note: string | null
}

export type TaxInvoiceInput = {
  customerId: number
  contractId?: number | null
  issueDate?: string | null
  supplyAmount: number
  taxAmount?: number | null
  status: TaxInvoiceStatus
  note?: string | null
}

export type TaxInvoiceQuery = {
  keyword?: string
  status?: TaxInvoiceStatus
  customerId?: number
  dateFrom?: string
  dateTo?: string
}

const BASE = '/api/sales/tax-invoices'
const key = ['sales', 'tax-invoices'] as const

export function useTaxInvoices(query: TaxInvoiceQuery) {
  return useQuery({
    queryKey: [...key, query],
    queryFn: async () => {
      const params: Record<string, string | number> = {}
      if (query.keyword) params.keyword = query.keyword
      if (query.status) params.status = query.status
      if (query.customerId) params.customerId = query.customerId
      if (query.dateFrom) params.dateFrom = query.dateFrom
      if (query.dateTo) params.dateTo = query.dateTo
      return (await apiClient.get<TaxInvoice[]>(BASE, { params })).data
    },
  })
}

export function useSaveTaxInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id?: number; body: TaxInvoiceInput }) =>
      id
        ? (await apiClient.put<TaxInvoice>(`${BASE}/${id}`, body)).data
        : (await apiClient.post<TaxInvoice>(BASE, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export function useDeleteTaxInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`${BASE}/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export const TAX_INVOICE_STATUS: Record<TaxInvoiceStatus, string> = {
  DRAFT: '작성',
  ISSUED: '발행',
  SENT: '전송',
}

export const won = (n: number) => (n ?? 0).toLocaleString('ko-KR')
