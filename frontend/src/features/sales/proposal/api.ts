import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export type ProposalStatus = 'DRAFT' | 'SUBMITTED' | 'WON' | 'LOST'

export type Proposal = {
  id: number
  code: string
  customerId: number
  customerName: string
  projectId: number | null
  projectName: string | null
  proposalDate: string | null
  title: string
  amount: number
  status: ProposalStatus
  note: string | null
}

export type ProposalInput = {
  customerId: number
  projectId?: number | null
  proposalDate?: string | null
  title: string
  amount?: number | null
  status: ProposalStatus
  note?: string | null
}

export type ProposalQuery = {
  keyword?: string
  status?: ProposalStatus
  customerId?: number
  dateFrom?: string
  dateTo?: string
}

type ProjectItem = {
  id: number
  code: string
  name: string
}

const BASE = '/api/sales/proposals'
const key = ['sales', 'proposals'] as const

export function useProposals(query: ProposalQuery) {
  return useQuery({
    queryKey: [...key, query],
    queryFn: async () => {
      const params: Record<string, string | number> = {}
      if (query.keyword) params.keyword = query.keyword
      if (query.status) params.status = query.status
      if (query.customerId) params.customerId = query.customerId
      if (query.dateFrom) params.dateFrom = query.dateFrom
      if (query.dateTo) params.dateTo = query.dateTo
      return (await apiClient.get<Proposal[]>(BASE, { params })).data
    },
  })
}

export function useSaveProposal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id?: number; body: ProposalInput }) =>
      id
        ? (await apiClient.put<Proposal>(`${BASE}/${id}`, body)).data
        : (await apiClient.post<Proposal>(BASE, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export function useDeleteProposal() {
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

export const PROPOSAL_STATUS: Record<ProposalStatus, string> = {
  DRAFT: '작성중',
  SUBMITTED: '제출',
  WON: '수주',
  LOST: '실패',
}

export const won = (n: number) => (n ?? 0).toLocaleString('ko-KR')
