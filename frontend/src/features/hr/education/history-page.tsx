import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
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
import { SelectDropdown } from '@/components/select-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  useEducationRequests,
  EDU_TYPE,
  won,
  type EducationType,
} from './api'

const pad = (n: number) => String(n).padStart(2, '0')
const ymd = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

const TYPE_ITEMS = (
  Object.entries(EDU_TYPE) as [EducationType, string][]
).map(([value, label]) => ({ label, value }))

type EmpStat = {
  employeeId: number
  employeeName: string
  departmentName: string | null
  count: number
  totalCost: number
}

export function EduHistoryPage() {
  const now = new Date()
  const [eduType, setEduType] = useState<EducationType | undefined>(undefined)
  const [dateFrom, setDateFrom] = useState(
    ymd(new Date(now.getFullYear(), 0, 1))
  )
  const [dateTo, setDateTo] = useState(ymd(new Date(now.getFullYear(), 11, 31)))

  const { data: rows, isLoading } = useEducationRequests({
    eduType,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  })

  const list = rows ?? []

  // 직원별 집계
  const statMap = new Map<number, EmpStat>()
  for (const r of list) {
    let stat = statMap.get(r.employeeId)
    if (!stat) {
      stat = {
        employeeId: r.employeeId,
        employeeName: r.employeeName,
        departmentName: r.departmentName,
        count: 0,
        totalCost: 0,
      }
      statMap.set(r.employeeId, stat)
    }
    stat.count += 1
    stat.totalCost += r.cost
  }
  const stats = Array.from(statMap.values()).sort((a, b) =>
    a.employeeName.localeCompare(b.employeeName)
  )

  const totalCount = stats.reduce((s, r) => s + r.count, 0)
  const totalCost = stats.reduce((s, r) => s + r.totalCost, 0)

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
            <h2 className='text-2xl font-bold tracking-tight'>교육이력</h2>
            <p className='text-muted-foreground'>
              05.인사 / 교육관리 — 기간·유형별 직원 교육이력 집계
            </p>
          </div>
          <div className='flex flex-wrap items-end gap-2'>
            <SelectDropdown
              defaultValue='ALL'
              onValueChange={(v) =>
                setEduType(v === 'ALL' ? undefined : (v as EducationType))
              }
              placeholder='유형'
              items={[{ label: '전체', value: 'ALL' }, ...TYPE_ITEMS]}
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
            신청건수 <b>{list.length}</b>
          </span>
          <span>
            직원수 <b>{stats.length}</b>
          </span>
          <span>
            교육비 합계 <b>{won(totalCost)}</b> 원
          </span>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>직원</TableHead>
                <TableHead>부서</TableHead>
                <TableHead className='w-24 text-end'>교육건수</TableHead>
                <TableHead className='w-36 text-end'>교육비 합계(원)</TableHead>
                <TableHead>유형</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className='h-24 text-center'>
                    불러오는 중…
                  </TableCell>
                </TableRow>
              ) : stats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className='h-24 text-center'>
                    결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                stats.map((s) => {
                  const empRows = list.filter((r) => r.employeeId === s.employeeId)
                  const types = [...new Set(empRows.map((r) => r.eduType))]
                  return (
                    <TableRow key={s.employeeId}>
                      <TableCell className='font-medium'>
                        {s.employeeName}
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {s.departmentName ?? '-'}
                      </TableCell>
                      <TableCell className='text-end'>{s.count}</TableCell>
                      <TableCell className='text-end'>{won(s.totalCost)}</TableCell>
                      <TableCell>
                        <div className='flex flex-wrap gap-1'>
                          {types.map((t) => (
                            <Badge key={t} variant='outline'>
                              {EDU_TYPE[t]}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
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
                    {won(totalCost)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      </Main>
    </>
  )
}
