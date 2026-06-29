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
import { SelectDropdown } from '@/components/select-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  useLeaveRequests,
  LEAVE_TYPE,
  WORK_TYPES,
  type LeaveRequestType,
} from './api'

const pad = (n: number) => String(n).padStart(2, '0')
const ymd = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

const TYPE_ITEMS = (Object.entries(LEAVE_TYPE) as [LeaveRequestType, string][]).map(
  ([value, label]) => ({ label, value })
)

type EmpStat = {
  employeeId: number
  employeeName: string
  departmentName: string | null
  count: number
  approvedDays: number
  overtimeHours: number
}

export function LeaveStatusPage() {
  const now = new Date()
  const [requestType, setRequestType] = useState<LeaveRequestType | undefined>(undefined)
  const [dateFrom, setDateFrom] = useState(ymd(new Date(now.getFullYear(), 0, 1)))
  const [dateTo, setDateTo] = useState(ymd(new Date(now.getFullYear(), 11, 31)))

  const { data: rows, isLoading } = useLeaveRequests({
    requestType,
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
        approvedDays: 0,
        overtimeHours: 0,
      }
      statMap.set(r.employeeId, stat)
    }
    stat.count += 1
    if (r.status === 'APPROVED' && r.days != null) {
      stat.approvedDays += Number(r.days)
    }
    if (
      r.status === 'APPROVED' &&
      WORK_TYPES.includes(r.requestType as LeaveRequestType) &&
      r.hours != null
    ) {
      stat.overtimeHours += Number(r.hours)
    }
  }
  const stats = Array.from(statMap.values()).sort((a, b) =>
    a.employeeName.localeCompare(b.employeeName)
  )

  const totalCount = stats.reduce((s, r) => s + r.count, 0)
  const totalDays = stats.reduce((s, r) => s + r.approvedDays, 0)
  const totalHours = stats.reduce((s, r) => s + r.overtimeHours, 0)

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
            <h2 className='text-2xl font-bold tracking-tight'>휴가·근로 현황</h2>
            <p className='text-muted-foreground'>
              05.인사 / 근태 — 기간·종류별 집계
            </p>
          </div>
          <div className='flex flex-wrap items-end gap-2'>
            <SelectDropdown
              defaultValue='ALL'
              onValueChange={(v) =>
                setRequestType(v === 'ALL' ? undefined : (v as LeaveRequestType))
              }
              placeholder='유형'
              items={[{ label: '전체', value: 'ALL' }, ...TYPE_ITEMS]}
              className='w-32'
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
            승인일수 합계 <b>{totalDays.toFixed(1)}</b>일
          </span>
          <span>
            연장근로 합계 <b>{totalHours.toFixed(1)}</b>h
          </span>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>직원</TableHead>
                <TableHead>부서</TableHead>
                <TableHead className='w-24 text-end'>신청건수</TableHead>
                <TableHead className='w-28 text-end'>승인일수</TableHead>
                <TableHead className='w-28 text-end'>연장근로시간</TableHead>
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
                stats.map((s) => (
                  <TableRow key={s.employeeId}>
                    <TableCell className='font-medium'>{s.employeeName}</TableCell>
                    <TableCell className='text-muted-foreground'>
                      {s.departmentName ?? '-'}
                    </TableCell>
                    <TableCell className='text-end'>{s.count}</TableCell>
                    <TableCell className='text-end'>
                      {s.approvedDays.toFixed(1)}일
                    </TableCell>
                    <TableCell className='text-end'>
                      {s.overtimeHours.toFixed(1)}h
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {stats.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2}>합계</TableCell>
                  <TableCell className='text-end font-semibold'>{totalCount}</TableCell>
                  <TableCell className='text-end font-semibold'>
                    {totalDays.toFixed(1)}일
                  </TableCell>
                  <TableCell className='text-end font-semibold'>
                    {totalHours.toFixed(1)}h
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
