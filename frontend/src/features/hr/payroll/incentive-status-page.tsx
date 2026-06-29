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

type EmpBonus = {
  employeeId: number
  employeeName: string
  departmentName: string | null
  count: number
  bonusTotal: number
}

export function IncentiveStatusPage() {
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

  // 직원별 상여 집계
  const statMap = new Map<number, EmpBonus>()
  for (const r of list) {
    let stat = statMap.get(r.employeeId)
    if (!stat) {
      stat = {
        employeeId: r.employeeId,
        employeeName: r.employeeName,
        departmentName: r.departmentName,
        count: 0,
        bonusTotal: 0,
      }
      statMap.set(r.employeeId, stat)
    }
    stat.count += 1
    stat.bonusTotal += Number(r.bonus)
  }
  const stats = Array.from(statMap.values()).sort((a, b) =>
    a.employeeName.localeCompare(b.employeeName)
  )

  const totalCount = stats.reduce((s, r) => s + r.count, 0)
  const totalBonus = stats.reduce((s, r) => s + r.bonusTotal, 0)

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
            <h2 className='text-2xl font-bold tracking-tight'>인센티브 현황</h2>
            <p className='text-muted-foreground'>
              05.인사 / 급여 — 직원별 상여·성과금 집계
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
            직원수 <b>{stats.length}</b>
          </span>
          <span>
            명세건수 <b>{totalCount}</b>
          </span>
          <span>
            상여 합계 <b>{won(totalBonus)}</b> 원
          </span>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>직원</TableHead>
                <TableHead>부서</TableHead>
                <TableHead className='w-24 text-end'>명세건수</TableHead>
                <TableHead className='w-36 text-end'>상여 합계</TableHead>
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
                  <TableRow key={s.employeeId}>
                    <TableCell className='font-medium'>
                      {s.employeeName}
                    </TableCell>
                    <TableCell className='text-muted-foreground'>
                      {s.departmentName ?? '-'}
                    </TableCell>
                    <TableCell className='text-end'>{s.count}</TableCell>
                    <TableCell className='text-end'>
                      {won(s.bonusTotal)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {stats.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2}>합계</TableCell>
                  <TableCell className='text-end font-semibold'>
                    {totalCount}
                  </TableCell>
                  <TableCell className='text-end font-semibold'>
                    {won(totalBonus)}
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
