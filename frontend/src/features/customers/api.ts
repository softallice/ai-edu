import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import {
  type Customer,
  type CustomerForm,
  type CustomerSummary,
} from './data/schema'

const BASE = '/api/customers'
const customersKey = ['customers'] as const

// 목록 조회 (레거시 SEARCH00). 키워드는 백엔드 동적 검색으로 전달.
export function useCustomers(keyword?: string) {
  return useQuery({
    queryKey: [...customersKey, { keyword: keyword ?? '' }],
    queryFn: async () => {
      const params = keyword ? { keyword } : undefined
      const { data } = await apiClient.get<CustomerSummary[]>(BASE, { params })
      return data
    },
  })
}

// 단건(담당자 포함) 조회 (레거시 SEARCH01).
export function useCustomer(id: number | null) {
  return useQuery({
    queryKey: [...customersKey, id],
    queryFn: async () => {
      const { data } = await apiClient.get<Customer>(`${BASE}/${id}`)
      return data
    },
    enabled: id != null,
  })
}

// 생성 (레거시 SAVE00 - 신규).
export function useCreateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CustomerForm) => {
      const { data } = await apiClient.post<Customer>(BASE, body)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customersKey }),
  })
}

// 수정 (레거시 SAVE00 - 수정).
export function useUpdateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id: number; body: CustomerForm }) => {
      const { data } = await apiClient.put<Customer>(`${BASE}/${id}`, body)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customersKey }),
  })
}

// 삭제 (레거시 DELETE00).
export function useDeleteCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`${BASE}/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customersKey }),
  })
}
