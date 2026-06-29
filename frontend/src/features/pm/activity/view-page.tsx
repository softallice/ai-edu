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
import { useEmployees } from '@/features/hr/api'
import { useProjects, useTimesheets, ACTIVITY_TYPES } from './api'

const pad = (n: number) => String(n).padStart(2, '0')
const ymd = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
function defaultRange() {
  const now = new Date()
  return {
    from: ymd(new Date(now.getFullYear(), now.getMonth(), 1)),
    to: ymd(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  }
}

const VALIDATED_FILTER = [
  { label: '전체', value: 'ALL' },
  { label: '승인', value: 'TRUE' },
  { label: '대기', value: 'FALSE' },
]

export function ActivityViewPage() {
  const { data: employees } = useEmployees()
  const { data: projects } = useProjects()
  const init = defaultRange()
  const [employeeId, setEmployeeId] = useState<number | undefined>(undefined)
  const [projectId, setProjectId] = useState<number | undefined>(undefined)
  const [dateFrom, setDateFrom] = useState(init.from)
  const [dateTo, setDateTo] = useState(init.to)
  const [validated, setValidated] = useState<boolean | undefined>(undefined)

  const { data: rows, isLoading } = useTimesheets({
    employeeId,
    projectId,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    validated,
  })

  const empItems = (employees ?? []).map((e) => ({
    label: `${e.name} (${e.employeeNo})`,
    value: String(e.id),
  }))
  const projItems = (projects ?? []).map((p) => ({
    label: p.name,
    value: String(p.id),
  }))

  const list = rows ?? []
  const totalHours = list.reduce((s, r) => s + r.hours, 0)
  const billableHours = list
    .filter((r) => r.billable)
    .reduce((s, r) => s + r.hours, 0)

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>
      <Main className='flex flex-1 flex-col gap-4'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>활동시간 조회</h2>
          <p className='text-muted-foreground'>
            기간·직원·프로젝트별 공수 집계 — 01.프로젝트관리 / 활동관리 (koerp
            timesheet 이관)
          </p>
        </div>

        <div className='flex flex-wrap items-end gap-2'>
          <Filter label='직원'>
            <SelectDropdown
              defaultValue='ALL'
              onValueChange={(v) =>
                setEmployeeId(v && v !== 'ALL' ? Number(v) : undefined)
              }
              placeholder='전체'
              items={[{ label: '전체', value: 'ALL' }, ...empItems]}
              className='w-44'
            />
          </Filter>
          <Filter label='프로젝트'>
            <SelectDropdown
              defaultValue='ALL'
              onValueChange={(v) =>
                setProjectId(v && v !== 'ALL' ? Number(v) : undefined)
              }
              placeholder='전체'
              items={[{ label: '전체', value: 'ALL' }, ...projItems]}
              className='w-52'
            />
          </Filter>
          <Filter label='시작일'>
            <Input
              type='date'
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className='w-40'
            />
          </Filter>
          <Filter label='종료일'>
            <Input
              type='date'
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className='w-40'
            />
          </Filter>
          <Filter label='승인상태'>
            <SelectDropdown
              defaultValue='ALL'
              onValueChange={(v) =>
                setValidated(v === 'ALL' ? undefined : v === 'TRUE')
              }
              placeholder='전체'
              items={VALIDATED_FILTER}
              className='w-28'
            />
          </Filter>
        </div>

        <div className='flex flex-wrap gap-4 text-sm'>
          <span>
            건수 <b>{list.length}</b>
          </span>
          <span>
            총 시간 <b>{totalHours.toFixed(1)}h</b>
          </span>
          <span>
            청구 시간 <b>{billableHours.toFixed(1)}h</b>
          </span>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-28'>일자</TableHead>
                <TableHead className='w-28'>직원</TableHead>
                <TableHead>프로젝트</TableHead>
                <TableHead className='w-20'>활동</TableHead>
                <TableHead className='w-20 text-end'>시간</TableHead>
                <TableHead className='w-16 text-center'>청구</TableHead>
                <TableHead className='w-16 text-center'>승인</TableHead>
                <TableHead>내용</TableHead>
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
                    조회 결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                list.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className='font-medium'>{t.workDate}</TableCell>
                    <TableCell>{t.employeeName}</TableCell>
                    <TableCell>{t.projectName}</TableCell>
                    <TableCell>
                      {ACTIVITY_TYPES[t.activityType] ?? t.activityType}
                    </TableCell>
                    <TableCell className='text-end'>
                      {t.hours.toFixed(1)}
                    </TableCell>
                    <TableCell className='text-center'>
                      {t.billable ? '○' : '-'}
                    </TableCell>
                    <TableCell className='text-center'>
                      <Badge variant={t.validated ? 'default' : 'outline'}>
                        {t.validated ? '승인' : '대기'}
                      </Badge>
                    </TableCell>
                    <TableCell className='max-w-xs truncate'>
                      {t.description ?? '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {list.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4}>합계</TableCell>
                  <TableCell className='text-end font-semibold'>
                    {totalHours.toFixed(1)}
                  </TableCell>
                  <TableCell colSpan={3} />
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      </Main>
    </>
  )
}

function Filter({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className='space-y-1'>
      <label className='text-xs text-muted-foreground'>{label}</label>
      {children}
    </div>
  )
}
