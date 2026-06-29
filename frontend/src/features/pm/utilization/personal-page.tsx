import { useState, useMemo } from 'react'
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
import { useTimesheets } from '@/features/pm/activity/api'
import { useEmployees, STANDARD_MONTHLY_HOURS } from './api'

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

type UtilRow = {
  employeeId: number
  employeeName: string
  inputHours: number
  billableHours: number
  standardHours: number
  utilRate: number
  billableRate: number
}

export function PersonalUtilizationPage() {
  const { data: employees } = useEmployees()
  const init = defaultRange()
  const [selectedEmpId, setSelectedEmpId] = useState<number | undefined>(
    undefined
  )
  const [dateFrom, setDateFrom] = useState(init.from)
  const [dateTo, setDateTo] = useState(init.to)

  const { data: rows, isLoading } = useTimesheets({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  })

  const empItems = (employees ?? []).map((e) => ({
    label: `${e.name} (${e.employeeNo})`,
    value: String(e.id),
  }))

  const utilRows: UtilRow[] = useMemo(() => {
    const list = rows ?? []

    // 직원별 집계 맵
    const map = new Map<
      number,
      { name: string; input: number; billable: number }
    >()
    for (const t of list) {
      const prev = map.get(t.employeeId)
      if (prev) {
        prev.input += t.hours
        if (t.billable) prev.billable += t.hours
      } else {
        map.set(t.employeeId, {
          name: t.employeeName,
          input: t.hours,
          billable: t.billable ? t.hours : 0,
        })
      }
    }

    // 특정 직원 필터: 해당 직원만(데이터 없어도 0 행 표시)
    if (selectedEmpId !== undefined) {
      const found = map.get(selectedEmpId)
      const emp = (employees ?? []).find((e) => e.id === selectedEmpId)
      const name = found?.name ?? emp?.name ?? String(selectedEmpId)
      const input = found?.input ?? 0
      const billable = found?.billable ?? 0
      return [
        {
          employeeId: selectedEmpId,
          employeeName: name,
          inputHours: input,
          billableHours: billable,
          standardHours: STANDARD_MONTHLY_HOURS,
          utilRate: Math.round((input / STANDARD_MONTHLY_HOURS) * 1000) / 10,
          billableRate:
            Math.round((billable / STANDARD_MONTHLY_HOURS) * 1000) / 10,
        },
      ]
    }

    // 전체: 데이터 있는 직원만
    return Array.from(map.entries()).map(([id, v]) => ({
      employeeId: id,
      employeeName: v.name,
      inputHours: v.input,
      billableHours: v.billable,
      standardHours: STANDARD_MONTHLY_HOURS,
      utilRate: Math.round((v.input / STANDARD_MONTHLY_HOURS) * 1000) / 10,
      billableRate:
        Math.round((v.billable / STANDARD_MONTHLY_HOURS) * 1000) / 10,
    }))
  }, [rows, selectedEmpId, employees])

  const totalPersons = utilRows.length
  const totalInputHours = utilRows.reduce((s, r) => s + r.inputHours, 0)
  const avgUtilRate =
    totalPersons > 0
      ? Math.round(
          (utilRows.reduce((s, r) => s + r.utilRate, 0) / totalPersons) * 10
        ) / 10
      : 0

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
              개인가동율조회
            </h2>
            <p className='text-muted-foreground'>
              01.프로젝트관리 / 가동율관리 — 직원별 투입·청구 가동율 집계
            </p>
          </div>
          <div className='flex items-end gap-2'>
            <Filter label='직원'>
              <SelectDropdown
                defaultValue='ALL'
                onValueChange={(v) =>
                  setSelectedEmpId(v && v !== 'ALL' ? Number(v) : undefined)
                }
                placeholder='전체'
                items={[{ label: '전체', value: 'ALL' }, ...empItems]}
                className='w-48'
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
          </div>
        </div>

        <div className='flex flex-wrap gap-4 text-sm'>
          <span>
            대상 인원 <b>{totalPersons}</b>명
          </span>
          <span>
            총 투입시간 <b>{totalInputHours.toFixed(1)}</b>h
          </span>
          <span>
            평균 가동율 <b>{avgUtilRate.toFixed(1)}</b>%
          </span>
          <span className='text-muted-foreground'>
            표준근무시간 {STANDARD_MONTHLY_HOURS}h/월
          </span>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-36'>직원</TableHead>
                <TableHead className='w-28 text-end'>투입시간(h)</TableHead>
                <TableHead className='w-32 text-end'>청구가능시간(h)</TableHead>
                <TableHead className='w-28 text-end'>표준시간(h)</TableHead>
                <TableHead className='w-24 text-end'>가동율(%)</TableHead>
                <TableHead className='w-28 text-end'>청구가동율(%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className='h-24 text-center'>
                    불러오는 중…
                  </TableCell>
                </TableRow>
              ) : utilRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className='h-24 text-center'>
                    조회 결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                utilRows.map((r) => (
                  <TableRow key={r.employeeId}>
                    <TableCell className='font-medium'>
                      {r.employeeName}
                    </TableCell>
                    <TableCell className='text-end'>
                      {r.inputHours.toFixed(1)}
                    </TableCell>
                    <TableCell className='text-end'>
                      {r.billableHours.toFixed(1)}
                    </TableCell>
                    <TableCell className='text-end'>
                      {r.standardHours}
                    </TableCell>
                    <TableCell className='text-end'>
                      {r.utilRate.toFixed(1)}
                    </TableCell>
                    <TableCell className='text-end'>
                      {r.billableRate.toFixed(1)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {utilRows.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell>합계 / 평균</TableCell>
                  <TableCell className='text-end font-semibold'>
                    {totalInputHours.toFixed(1)}
                  </TableCell>
                  <TableCell className='text-end font-semibold'>
                    {utilRows
                      .reduce((s, r) => s + r.billableHours, 0)
                      .toFixed(1)}
                  </TableCell>
                  <TableCell className='text-end font-semibold'>
                    {totalPersons * STANDARD_MONTHLY_HOURS}
                  </TableCell>
                  <TableCell className='text-end font-semibold'>
                    {avgUtilRate.toFixed(1)}
                  </TableCell>
                  <TableCell className='text-end font-semibold'>
                    {totalPersons > 0
                      ? (
                          Math.round(
                            (utilRows.reduce((s, r) => s + r.billableRate, 0) /
                              totalPersons) *
                              10
                          ) / 10
                        ).toFixed(1)
                      : '0.0'}
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
