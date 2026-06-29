import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export type NoticeCategory = 'SYSTEM' | 'GENERAL'

export type Notice = {
  id: number
  code: string
  title: string
  content: string | null
  author: string | null
  category: NoticeCategory
  postedDate: string | null
  pinned: boolean
}

export type NoticeInput = {
  title: string
  content?: string | null
  author?: string | null
  category: NoticeCategory
  postedDate?: string | null
  pinned: boolean
}

export type NoticeQuery = {
  keyword?: string
  category?: NoticeCategory
  dateFrom?: string
  dateTo?: string
}

const BASE = '/api/notices'
const key = ['common', 'notices'] as const

export function useNotices(query: NoticeQuery) {
  return useQuery({
    queryKey: [...key, query],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (query.keyword) params.keyword = query.keyword
      if (query.category) params.category = query.category
      if (query.dateFrom) params.dateFrom = query.dateFrom
      if (query.dateTo) params.dateTo = query.dateTo
      return (await apiClient.get<Notice[]>(BASE, { params })).data
    },
  })
}

export function useSaveNotice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id?: number; body: NoticeInput }) =>
      id
        ? (await apiClient.put<Notice>(`${BASE}/${id}`, body)).data
        : (await apiClient.post<Notice>(BASE, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export function useDeleteNotice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`${BASE}/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export const NOTICE_CATEGORY: Record<NoticeCategory, string> = {
  SYSTEM: '시스템안내',
  GENERAL: '일반공지',
}
