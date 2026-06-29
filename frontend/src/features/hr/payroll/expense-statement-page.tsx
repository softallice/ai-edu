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
import { usePayslips, won } from './api'

const pad = (n: number) => String(n).padStart(2, '0')
const ym = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`

type MonthStat = {
  payMonth: string
  count: number
  netPayTotal: number
  deductionTotal: number
}

export function ExpenseStatementPage() {
  const now = new Date()
  const [payMonthFrom, setPayMonthFrom] = useState(
    ym(new Date(now.getFullYear(), 0, 1))
  )
  const [payMonthTo, setPayMonthTo] = useState(
    ym(new Date(now.getFullYear(), 11, 1))
  )

  const { data: rows, isLoading } = usePayslips({
    payMonthFrom: payMonthFrom || undefined,
    payMonthTo: payMonthTo || undefined,
  })

  const list = rows ?? []

  // 귀속월별 집계
  const statMap = new Map<string, MonthStat>()
  for (const r of list) {
    let stat = statMap.get(r.payMonth)
    if (!stat) {
      stat = {
        payMonth: r.payMonth,
        count: 0,
        netPayTotal: 0,
        deductionTotal: 0,
      }
      statMap.set(r.payMonth, stat)
    }
    stat.count += 1
    stat.netPayTotal += Number(r.netPay)
    stat.deductionTotal += Number(r.deduction)
  }
  const stats = Array.from(statMap.values()).sort((a, b) =>
    a.payMonth.localeCompare(b.payMonth)
  )

  const totalCount = stats.reduce((s, r) => s + r.count, 0)
  const totalNetPay = stats.reduce((s, r) => s + r.netPayTotal, 0)
  const totalDeduction = stats.reduce((s, r) => s + r.deductionTotal, 0)

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
            <h2 className='text-2xl font-bold tracking-tight'>급여지급내역</h2>
            <p className='text-muted-foreground'>
              05.인사 / 급여 — 귀속월별 실지급액·공제 집계
            </p>
          </div>
          <div className='flex flex-wrap items-end gap-2'>
            <Input
              type='month'
              value={payMonthFrom}
              onChange={(e) => setPayMonthFrom(e.target.value)}
              className='w-40'
            />
            <Input
              type='month'
              value={payMonthTo}
              onChange={(e) => setPayMonthTo(e.target.value)}
              className='w-40'
            />
          </div>
        </div>

        <div className='flex flex-wrap gap-4 text-sm'>
          <span>
            월수 <b>{stats.length}</b>
          </span>
          <span>
            명세건수 <b>{totalCount}</b>
          </span>
          <span>
            실지급 합계 <b>{won(totalNetPay)}</b> 원
          </span>
          <span>
            공제 합계 <b>{won(totalDeduction)}</b> 원
          </span>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-28'>귀속월</TableHead>
                <TableHead className='w-24 text-end'>명세건수</TableHead>
                <TableHead className='w-40 text-end'>실지급액 합계</TableHead>
                <TableHead className='w-36 text-end'>공제 합계</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className='h-24 text-center'>
                    불러오는 중…
                  </TableCell>
                </TableRow>
              ) : stats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className='h-24 text-center'>
                    결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                stats.map((s) => (
                  <TableRow key={s.payMonth}>
                    <TableCell className='font-medium'>{s.payMonth}</TableCell>
                    <TableCell className='text-end'>{s.count}</TableCell>
                    <TableCell className='text-end'>
                      {won(s.netPayTotal)}
                    </TableCell>
                    <TableCell className='text-end'>
                      {won(s.deductionTotal)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {stats.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell>합계</TableCell>
                  <TableCell className='text-end font-semibold'>
                    {totalCount}
                  </TableCell>
                  <TableCell className='text-end font-semibold'>
                    {won(totalNetPay)}
                  </TableCell>
                  <TableCell className='text-end font-semibold'>
                    {won(totalDeduction)}
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
