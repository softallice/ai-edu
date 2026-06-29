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
import { useCardTransactions, won } from './api'

const pad = (n: number) => String(n).padStart(2, '0')
const ymd = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

type BillingSummary = {
  billingMonth: string
  cardNo: string
  count: number
  approvalTotal: number
  purchaseTotal: number
}

export function CardBillingPage() {
  const now = new Date()
  const [dateFrom, setDateFrom] = useState(
    ymd(new Date(now.getFullYear(), 0, 1))
  )
  const [dateTo, setDateTo] = useState(ymd(new Date(now.getFullYear(), 11, 31)))
  const [billingMonth, setBillingMonth] = useState('')

  const { data: rows, isLoading } = useCardTransactions({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    billingMonth: billingMonth || undefined,
  })

  const list = rows ?? []

  // 청구월×카드번호 단위 클라이언트 집계
  const summaryMap = new Map<string, BillingSummary>()
  for (const c of list) {
    const month = c.billingMonth ?? '(미청구)'
    const mapKey = `${month}__${c.cardNo}`
    const existing = summaryMap.get(mapKey)
    if (existing) {
      existing.count += 1
      existing.approvalTotal += c.approvalAmount
      existing.purchaseTotal += c.purchaseAmount
    } else {
      summaryMap.set(mapKey, {
        billingMonth: month,
        cardNo: c.cardNo,
        count: 1,
        approvalTotal: c.approvalAmount,
        purchaseTotal: c.purchaseAmount,
      })
    }
  }

  const summaries = Array.from(summaryMap.values()).sort((a, b) => {
    const monthCmp = a.billingMonth.localeCompare(b.billingMonth)
    return monthCmp !== 0 ? monthCmp : a.cardNo.localeCompare(b.cardNo)
  })

  const totalCount = summaries.reduce((s, r) => s + r.count, 0)
  const totalApproval = summaries.reduce((s, r) => s + r.approvalTotal, 0)
  const totalPurchase = summaries.reduce((s, r) => s + r.purchaseTotal, 0)

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
              법인카드 청구내역
            </h2>
            <p className='text-muted-foreground'>
              04.재무 / 법인카드 — 청구월×카드번호 집계
            </p>
          </div>
          <div className='flex flex-wrap items-end gap-2'>
            <Input
              value={billingMonth}
              onChange={(e) => setBillingMonth(e.target.value)}
              placeholder='청구월 (예: 2025-03)'
              maxLength={7}
              className='w-36'
            />
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
            청구 그룹 <b>{summaries.length}</b>
          </span>
          <span>
            총 건수 <b>{totalCount}</b>
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
                <TableHead className='w-28'>청구월</TableHead>
                <TableHead className='w-40'>카드번호</TableHead>
                <TableHead className='w-16 text-end'>건수</TableHead>
                <TableHead className='w-36 text-end'>승인금액</TableHead>
                <TableHead className='w-36 text-end'>매입금액</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className='h-24 text-center'>
                    불러오는 중…
                  </TableCell>
                </TableRow>
              ) : summaries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className='h-24 text-center'>
                    결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                summaries.map((s) => (
                  <TableRow key={`${s.billingMonth}__${s.cardNo}`}>
                    <TableCell>{s.billingMonth}</TableCell>
                    <TableCell className='font-medium'>{s.cardNo}</TableCell>
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
                  <TableCell colSpan={2}>합계</TableCell>
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
