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
  useAttendances,
  useEmployeeList,
  ATTENDANCE_STATUS,
  type AttendanceStatus,
} from './api'

const pad = (n: number) => String(n).padStart(2, '0')
const ymd = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

const STATUS_ITEMS = (
  Object.entries(ATTENDANCE_STATUS) as [AttendanceStatus, string][]
).map(([value, label]) => ({ label, value }))

export function AttendanceViewPage() {
  const now = new Date()
  const [employeeId, setEmployeeId] = useState<number | undefined>(undefined)
  const [status, setStatus] = useState<AttendanceStatus | undefined>(undefined)
  const [dateFrom, setDateFrom] = useState(
    ymd(new Date(now.getFullYear(), 0, 1))
  )
  const [dateTo, setDateTo] = useState(ymd(new Date(now.getFullYear(), 11, 31)))

  const { data: rows, isLoading } = useAttendances({
    employeeId,
    status,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  })
  const { data: employees } = useEmployeeList()

  const list = rows ?? []

  // 집계 — 직원별 근무시간합
  const totalWorkHours = list.reduce((s, r) => s + Number(r.workHours), 0)

  // 상태별 건수
  const countByStatus = (s: AttendanceStatus) =>
    list.filter((r) => r.status === s).length

  const empItems = (employees ?? []).map((e) => ({
    label: `${e.name} (${e.employeeNo})`,
    value: String(e.id),
  }))

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
            <h2 className='text-2xl font-bold tracking-tight'>출퇴근부 현황</h2>
            <p className='text-muted-foreground'>
              05.인사 / 근태관리 — 기간·직원별 조회
            </p>
          </div>
          <div className='flex flex-wrap items-end gap-2'>
            <SelectDropdown
              defaultValue='ALL'
              onValueChange={(v) =>
                setEmployeeId(v === 'ALL' ? undefined : Number(v))
              }
              placeholder='직원'
              items={[{ label: '전체', value: 'ALL' }, ...empItems]}
              className='w-44'
            />
            <SelectDropdown
              defaultValue='ALL'
              onValueChange={(v) =>
                setStatus(v === 'ALL' ? undefined : (v as AttendanceStatus))
              }
              placeholder='상태'
              items={[{ label: '전체', value: 'ALL' }, ...STATUS_ITEMS]}
              className='w-28'
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

        {/* 요약 줄 */}
        <div className='flex flex-wrap gap-4 text-sm'>
          <span>
            건수 <b>{list.length}</b>
          </span>
          <span>
            총 근무시간 <b>{totalWorkHours.toFixed(1)}</b>h
          </span>
          <span>
            정상 <b>{countByStatus('NORMAL')}</b>
          </span>
          <span>
            지각 <b>{countByStatus('LATE')}</b>
          </span>
          <span>
            휴가 <b>{countByStatus('LEAVE')}</b>
          </span>
          <span>
            결근 <b>{countByStatus('ABSENT')}</b>
          </span>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-36'>코드</TableHead>
                <TableHead>직원</TableHead>
                <TableHead className='w-28'>근무일</TableHead>
                <TableHead className='w-24'>출근</TableHead>
                <TableHead className='w-24'>퇴근</TableHead>
                <TableHead className='w-24 text-end'>근무시간</TableHead>
                <TableHead className='w-20'>상태</TableHead>
                <TableHead>비고</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className='h-24 text-center'>
                    불러오는 중…
                  </TableCell>
                </TableRow>
              ) : list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className='h-24 text-center'>
                    결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                list.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className='font-medium'>{a.code}</TableCell>
                    <TableCell>
                      {a.employeeName}
                      <span className='ml-1 text-xs text-muted-foreground'>
                        ({a.employeeNo})
                      </span>
                    </TableCell>
                    <TableCell>{a.workDate}</TableCell>
                    <TableCell>{a.checkIn ?? '-'}</TableCell>
                    <TableCell>{a.checkOut ?? '-'}</TableCell>
                    <TableCell className='text-end'>
                      {Number(a.workHours).toFixed(1)}h
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline'>
                        {ATTENDANCE_STATUS[a.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-muted-foreground'>
                      {a.note ?? '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {list.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={5}>합계</TableCell>
                  <TableCell className='text-end font-semibold'>
                    {totalWorkHours.toFixed(1)}h
                  </TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      </Main>
    </>
  )
}
