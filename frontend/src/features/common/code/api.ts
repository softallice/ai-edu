import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export type CommonCode = {
  id: number
  codeGroup: string
  code: string
  name: string
  sortOrder: number
  useYn: boolean
  description: string | null
}

export type CommonCodeInput = {
  codeGroup: string
  code: string
  name: string
  sortOrder: number
  useYn: boolean
  description?: string | null
}

export type CommonCodeQuery = {
  keyword?: string
  codeGroup?: string
  useYn?: boolean
}

const BASE = '/api/common/codes'
const key = ['common', 'codes'] as const

export function useCommonCodes(query: CommonCodeQuery) {
  return useQuery({
    queryKey: [...key, query],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (query.keyword) params.keyword = query.keyword
      if (query.codeGroup) params.codeGroup = query.codeGroup
      if (query.useYn !== undefined) params.useYn = String(query.useYn)
      return (await apiClient.get<CommonCode[]>(BASE, { params })).data
    },
  })
}

export function useSaveCommonCode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id?: number; body: CommonCodeInput }) =>
      id
        ? (await apiClient.put<CommonCode>(`${BASE}/${id}`, body)).data
        : (await apiClient.post<CommonCode>(BASE, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export function useDeleteCommonCode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`${BASE}/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}
