import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export type Voucher = {
  id: number
  code: string
  voucherDate: string
  account: string
  debit: number
  credit: number
  description: string | null
  projectId: number | null
  projectName: string | null
}

export type VoucherInput = {
  voucherDate: string
  account: string
  debit?: number
  credit?: number
  description?: string | null
  projectId?: number | null
}

export type VoucherQuery = {
  keyword?: string
  dateFrom?: string
  dateTo?: string
}

export type ProjectItem = {
  id: number
  code: string
  name: string
}

const BASE = '/api/finance/vouchers'
const key = ['finance', 'vouchers'] as const

export function useVouchers(query: VoucherQuery) {
  return useQuery({
    queryKey: [...key, query],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (query.keyword) params.keyword = query.keyword
      if (query.dateFrom) params.dateFrom = query.dateFrom
      if (query.dateTo) params.dateTo = query.dateTo
      return (await apiClient.get<Voucher[]>(BASE, { params })).data
    },
  })
}

export function useSaveVoucher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id?: number; body: VoucherInput }) =>
      id
        ? (await apiClient.put<Voucher>(`${BASE}/${id}`, body)).data
        : (await apiClient.post<Voucher>(BASE, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export function useDeleteVoucher() {
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
      (await apiClient.get<ProjectItem[]>('/api/pm/projects')).data,
  })
}

export const won = (n: number) => (n ?? 0).toLocaleString('ko-KR')
