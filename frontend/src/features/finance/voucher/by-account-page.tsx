import { useState } from 'react'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useVouchers, won } from './api'

const pad = (n: number) => String(n).padStart(2, '0')
const ymd = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

type AccountSummary = {
  account: string
  debitTotal: number
  creditTotal: number
  balance: number
}

export function VoucherByAccountPage() {
  const now = new Date()
  const [dateFrom, setDateFrom] = useState(
    ymd(new Date(now.getFullYear(), 0, 1))
  )
  const [dateTo, setDateTo] = useState(ymd(new Date(now.getFullYear(), 11, 31)))

  const { data: rows, isLoading } = useVouchers({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  })

  const list = rows ?? []

  // 계정과목별 집계
  const summaryMap = new Map<string, AccountSummary>()
  for (const v of list) {
    const existing = summaryMap.get(v.account)
    if (existing) {
      existing.debitTotal += v.debit
      existing.creditTotal += v.credit
      existing.balance = existing.debitTotal - existing.creditTotal
    } else {
      summaryMap.set(v.account, {
        account: v.account,
        debitTotal: v.debit,
        creditTotal: v.credit,
        balance: v.debit - v.credit,
      })
    }
  }
  const summaries = Array.from(summaryMap.values()).sort((a, b) =>
    a.account.localeCompare(b.account, 'ko')
  )

  const totalDebit = summaries.reduce((s, r) => s + r.debitTotal, 0)
  const totalCredit = summaries.reduce((s, r) => s + r.creditTotal, 0)
  const totalBalance = totalDebit - totalCredit

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>
      <Main className='flex flex-1 flex-col gap-4'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              전표 — 계정과목별
            </h2>
            <p className='text-muted-foreground'>
              04.재무 / 계정과목별 차변·대변 집계
            </p>
          </div>
          <div className='flex items-end gap-2'>
            <Input
              type='date'
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className='w-40'
            />
            <Input
              type='date'
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className='w-40'
            />
          </div>
        </div>

        <div className='flex flex-wrap gap-4 text-sm'>
          <span>
            계정 수 <b>{summaries.length}</b>
          </span>
          <span>
            차변 합계 <b>{won(totalDebit)}</b>
          </span>
          <span>
            대변 합계 <b>{won(totalCredit)}</b>
          </span>
          <span>
            잔액 <b>{won(totalBalance)}</b> 원
          </span>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>계정과목</TableHead>
                <TableHead className='w-36 text-end'>차변 합계</TableHead>
                <TableHead className='w-36 text-end'>대변 합계</TableHead>
                <TableHead className='w-36 text-end'>잔액</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className='h-24 text-center'>
                    불러오는 중…
                  </TableCell>
                </TableRow>
              ) : summaries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className='h-24 text-center'>
                    결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                summaries.map((s) => (
                  <TableRow key={s.account}>
                    <TableCell className='font-medium'>{s.account}</TableCell>
                    <TableCell className='text-end'>
                      {won(s.debitTotal)}
                    </TableCell>
                    <TableCell className='text-end'>
                      {won(s.creditTotal)}
                    </TableCell>
                    <TableCell className='text-end'>{won(s.balance)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {summaries.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell>총계</TableCell>
                  <TableCell className='text-end font-semibold'>
                    {won(totalDebit)}
                  </TableCell>
                  <TableCell className='text-end font-semibold'>
                    {won(totalCredit)}
                  </TableCell>
                  <TableCell className='text-end font-semibold'>
                    {won(totalBalance)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      </Main>
    </>
  )
}
