import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export type CardTransactionStatus = 'APPROVED' | 'PURCHASED' | 'BILLED' | 'PAID'

export type CardTransaction = {
  id: number
  code: string
  cardNo: string
  usedDate: string
  merchant: string | null
  approvalAmount: number
  purchaseAmount: number
  billingMonth: string | null
  status: CardTransactionStatus
  employeeId: number | null
  employeeName: string | null
  description: string | null
}

export type CardTransactionInput = {
  cardNo: string
  usedDate: string
  merchant?: string | null
  approvalAmount?: number
  purchaseAmount?: number
  billingMonth?: string | null
  status: CardTransactionStatus
  employeeId?: number | null
  description?: string | null
}

export type CardTransactionQuery = {
  keyword?: string
  status?: CardTransactionStatus
  billingMonth?: string
  dateFrom?: string
  dateTo?: string
}

export type EmployeeItem = {
  id: number
  name: string
}

export const CARD_TX_STATUS: Record<CardTransactionStatus, string> = {
  APPROVED: '승인',
  PURCHASED: '매입확정',
  BILLED: '청구',
  PAID: '결제완료',
}

const BASE = '/api/finance/card-transactions'
const key = ['finance', 'card-transactions'] as const

export function useCardTransactions(query: CardTransactionQuery) {
  return useQuery({
    queryKey: [...key, query],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (query.keyword) params.keyword = query.keyword
      if (query.status) params.status = query.status
      if (query.billingMonth) params.billingMonth = query.billingMonth
      if (query.dateFrom) params.dateFrom = query.dateFrom
      if (query.dateTo) params.dateTo = query.dateTo
      return (await apiClient.get<CardTransaction[]>(BASE, { params })).data
    },
  })
}

export function useSaveCardTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id?: number
      body: CardTransactionInput
    }) =>
      id
        ? (await apiClient.put<CardTransaction>(`${BASE}/${id}`, body)).data
        : (await apiClient.post<CardTransaction>(BASE, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export function useDeleteCardTransaction() {
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
    queryKey: ['hr', 'employees'],
    queryFn: async () =>
      (await apiClient.get<EmployeeItem[]>('/api/hr/employees')).data,
  })
}

export const won = (n: number) => (n ?? 0).toLocaleString('ko-KR')
