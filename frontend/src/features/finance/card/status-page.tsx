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
import { useCardTransactions, CARD_TX_STATUS, won, type CardTransactionStatus } from './api'

const pad = (n: number) => String(n).padStart(2, '0')
const ymd = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

type StatusSummary = {
  status: CardTransactionStatus
  label: string
  count: number
  approvalTotal: number
  purchaseTotal: number
}

export function CardStatusPage() {
  const now = new Date()
  const [dateFrom, setDateFrom] = useState(
    ymd(new Date(now.getFullYear(), 0, 1))
  )
  const [dateTo, setDateTo] = useState(ymd(new Date(now.getFullYear(), 11, 31)))

  const { data: rows, isLoading } = useCardTransactions({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  })

  const list = rows ?? []

  // 상태별 클라이언트 집계
  const summaryMap = new Map<CardTransactionStatus, StatusSummary>()
  for (const c of list) {
    const existing = summaryMap.get(c.status)
    if (existing) {
      existing.count += 1
      existing.approvalTotal += c.approvalAmount
      existing.purchaseTotal += c.purchaseAmount
    } else {
      summaryMap.set(c.status, {
        status: c.status,
        label: CARD_TX_STATUS[c.status],
        count: 1,
        approvalTotal: c.approvalAmount,
        purchaseTotal: c.purchaseAmount,
      })
    }
  }

  // 상태 순서: APPROVED → PURCHASED → BILLED → PAID
  const statusOrder: CardTransactionStatus[] = ['APPROVED', 'PURCHASED', 'BILLED', 'PAID']
  const summaries = statusOrder
    .map((s) => summaryMap.get(s))
    .filter((s): s is StatusSummary => s !== undefined)

  const totalCount = list.length
  const totalApproval = list.reduce((s, c) => s + c.approvalAmount, 0)
  const totalPurchase = list.reduce((s, c) => s + c.purchaseAmount, 0)

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
              법인카드 집계현황
            </h2>
            <p className='text-muted-foreground'>
              04.재무 / 법인카드 — 상태별 집계
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
            전체 건수 <b>{totalCount}</b>
          </span>
          <span>
            승인금액 합계 <b>{won(totalApproval)}</b>
          </span>
          <span>
            매입금액 합계 <b>{won(totalPurchase)}</b> 원
          </span>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>상태</TableHead>
                <TableHead className='w-20 text-end'>건수</TableHead>
                <TableHead className='w-36 text-end'>승인금액</TableHead>
                <TableHead className='w-36 text-end'>매입금액</TableHead>
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
                  <TableRow key={s.status}>
                    <TableCell className='font-medium'>{s.label}</TableCell>
                    <TableCell className='text-end'>{s.count}</TableCell>
                    <TableCell className='text-end'>
                      {won(s.approvalTotal)}
                    </TableCell>
                    <TableCell className='text-end'>
                      {won(s.purchaseTotal)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {summaries.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell>합계</TableCell>
                  <TableCell className='text-end font-semibold'>
                    {totalCount}
                  </TableCell>
                  <TableCell className='text-end font-semibold'>
                    {won(totalApproval)}
                  </TableCell>
                  <TableCell className='text-end font-semibold'>
                    {won(totalPurchase)}
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
