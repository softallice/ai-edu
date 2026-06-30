import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

// ─── Types ───────────────────────────────────────────────────────────────────

export type AccountType =
  | 'ASSET'
  | 'LIABILITY'
  | 'EQUITY'
  | 'INCOME'
  | 'EXPENSE'
export type JournalType = 'SALE' | 'PURCHASE' | 'BANK' | 'CASH' | 'GENERAL'

export const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
  ASSET: '자산',
  LIABILITY: '부채',
  EQUITY: '자본',
  INCOME: '수익',
  EXPENSE: '비용',
}

export const JOURNAL_TYPE_LABEL: Record<JournalType, string> = {
  SALE: '매출',
  PURCHASE: '매입',
  BANK: '은행',
  CASH: '현금',
  GENERAL: '일반',
}

export type Account = {
  id: number
  code: string
  name: string
  type: AccountType
  active: boolean
}

export type AccountInput = {
  code: string
  name: string
  type: AccountType
  active?: boolean
}

export type Journal = {
  id: number
  code: string
  name: string
  type: JournalType
  sequencePrefix: string
  active: boolean
}

export type JournalEntryLine = {
  id: number
  accountId: number
  accountCode: string
  accountName: string
  name: string
  debit: number
  credit: number
  currencyCode: string | null
  amountCurrency: number | null
}

export type JournalEntry = {
  id: number
  name: string
  entryDate: string
  ref: string | null
  journalId: number | null
  journalCode: string | null
  journalName: string | null
  sourceType: string | null
  sourceId: string | null
  lines: JournalEntryLine[]
  totalDebit: number
  totalCredit: number
}

export type JournalEntryLineInput = {
  accountCode: string
  name: string
  debit: number
  credit: number
  currencyCode?: string
  amountCurrency?: number
}

export type JournalEntryInput = {
  journalCode?: string
  ref?: string
  date: string
  lines: JournalEntryLineInput[]
}

// ─── Formatters ──────────────────────────────────────────────────────────────

export const won = (n: number) => (n ?? 0).toLocaleString('ko-KR')

// ─── Accounts ────────────────────────────────────────────────────────────────

const ACCOUNT_BASE = '/api/accounting/accounts'
const accountKey = ['accounting', 'accounts'] as const

export function useAccounts(params?: {
  keyword?: string
  type?: AccountType
  active?: boolean
}) {
  return useQuery({
    queryKey: [...accountKey, params],
    queryFn: async () => {
      const p: Record<string, string> = {}
      if (params?.keyword) p.keyword = params.keyword
      if (params?.type) p.type = params.type
      if (params?.active !== undefined) p.active = String(params.active)
      return (await apiClient.get<Account[]>(ACCOUNT_BASE, { params: p })).data
    },
  })
}

export function useSaveAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id?: number; body: AccountInput }) =>
      id
        ? (await apiClient.put<Account>(`${ACCOUNT_BASE}/${id}`, body)).data
        : (await apiClient.post<Account>(ACCOUNT_BASE, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: accountKey }),
  })
}

export function useDeleteAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`${ACCOUNT_BASE}/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: accountKey }),
  })
}

// ─── Journals ────────────────────────────────────────────────────────────────

const JOURNAL_BASE = '/api/accounting/journals'
const journalKey = ['accounting', 'journals'] as const

export function useJournals() {
  return useQuery({
    queryKey: journalKey,
    queryFn: async () => (await apiClient.get<Journal[]>(JOURNAL_BASE)).data,
  })
}

// ─── Journal Entries ─────────────────────────────────────────────────────────

const ENTRY_BASE = '/api/accounting/journal-entries'
const entryKey = ['accounting', 'journal-entries'] as const

export function useJournalEntries(params?: {
  keyword?: string
  journalCode?: string
  dateFrom?: string
  dateTo?: string
}) {
  return useQuery({
    queryKey: [...entryKey, params],
    queryFn: async () => {
      const p: Record<string, string> = {}
      if (params?.keyword) p.keyword = params.keyword
      if (params?.journalCode) p.journalCode = params.journalCode
      if (params?.dateFrom) p.dateFrom = params.dateFrom
      if (params?.dateTo) p.dateTo = params.dateTo
      return (await apiClient.get<JournalEntry[]>(ENTRY_BASE, { params: p }))
        .data
    },
  })
}

export function useSaveJournalEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: JournalEntryInput) =>
      (await apiClient.post<JournalEntry>(ENTRY_BASE, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: entryKey }),
  })
}

export function useDeleteJournalEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`${ENTRY_BASE}/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: entryKey }),
  })
}
