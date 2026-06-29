import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export type ContractState =
  | 'DRAFT'
  | 'SIGNED'
  | 'IN_PROGRESS'
  | 'DONE'
  | 'TERMINATED'

export type ContractLine = {
  id: number
  itemName: string
  spec: string | null
  quantity: number
  unitPrice: number
  amount: number
  remark: string | null
}

export type ContractSummary = {
  id: number
  code: string
  name: string
  customerId: number
  customerName: string
  projectName: string | null
  ownerName: string | null
  state: ContractState
  contractDate: string | null
  startDate: string | null
  endDate: string | null
  currency: string
  totalAmount: number
  lineCount: number
  active: boolean
}

export type Contract = {
  id: number
  code: string
  name: string
  customerId: number
  customerName: string
  projectId: number | null
  projectName: string | null
  ownerId: number | null
  ownerName: string | null
  state: ContractState
  contractDate: string | null
  startDate: string | null
  endDate: string | null
  currency: string
  note: string | null
  totalAmount: number
  active: boolean
  lines: ContractLine[]
}

export type ContractLineRow = {
  lineId: number
  contractId: number
  contractCode: string
  contractName: string
  customerName: string
  state: ContractState
  itemName: string
  spec: string | null
  quantity: number
  unitPrice: number
  amount: number
}

export type ContractLineInput = {
  itemName: string
  spec?: string | null
  quantity: number
  unitPrice: number
  remark?: string | null
}

export type ContractInput = {
  name: string
  customerId: number
  projectId?: number | null
  ownerId?: number | null
  state: ContractState
  contractDate?: string | null
  startDate?: string | null
  endDate?: string | null
  currency?: string
  note?: string | null
  active?: boolean
  lines: ContractLineInput[]
}

const BASE = '/api/sales/contracts'
const key = ['sales', 'contracts'] as const

export function useContracts(keyword?: string, state?: ContractState) {
  return useQuery({
    queryKey: [...key, { keyword: keyword ?? '', state: state ?? '' }],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (keyword) params.keyword = keyword
      if (state) params.state = state
      return (await apiClient.get<ContractSummary[]>(BASE, { params })).data
    },
  })
}

export function useContractLines(keyword?: string, state?: ContractState) {
  return useQuery({
    queryKey: [...key, 'lines', { keyword: keyword ?? '', state: state ?? '' }],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (keyword) params.keyword = keyword
      if (state) params.state = state
      return (
        await apiClient.get<ContractLineRow[]>(`${BASE}/lines`, { params })
      ).data
    },
  })
}

export async function fetchContract(id: number) {
  return (await apiClient.get<Contract>(`${BASE}/${id}`)).data
}

export function useSaveContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id?: number; body: ContractInput }) =>
      id
        ? (await apiClient.put<Contract>(`${BASE}/${id}`, body)).data
        : (await apiClient.post<Contract>(BASE, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export function useDeleteContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`${BASE}/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export const CONTRACT_STATES: Record<ContractState, string> = {
  DRAFT: '초안',
  SIGNED: '체결',
  IN_PROGRESS: '진행중',
  DONE: '완료',
  TERMINATED: '해지',
}

export const won = (n: number) => (n ?? 0).toLocaleString('ko-KR')
