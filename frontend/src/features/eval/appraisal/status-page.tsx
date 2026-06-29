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
import { useAppraisals, APPRAISAL_STATUS, type AppraisalStatus } from './api'

const STATUS_ITEMS = (
  Object.entries(APPRAISAL_STATUS) as [AppraisalStatus, string][]
).map(([value, label]) => ({ label, value }))

type GroupRow = {
  period: string
  status: AppraisalStatus
  count: number
  avgSecond: number | null
}

export function EvalStatusPage() {
  const [period, setPeriod] = useState('')
  const [status, setStatus] = useState<AppraisalStatus | undefined>(undefined)

  const { data: rows, isLoading } = useAppraisals({
    period: period || undefined,
    status,
  })

  const list = rows ?? []

  // 기간×상태별 집계
  const groupMap = new Map<string, GroupRow>()
  for (const a of list) {
    const k = `${a.period}::${a.status}`
    const existing = groupMap.get(k)
    if (existing) {
      existing.count += 1
      if (a.secondScore != null) {
        existing.avgSecond =
          existing.avgSecond == null
            ? a.secondScore
            : existing.avgSecond + a.secondScore
      }
    } else {
      groupMap.set(k, {
        period: a.period,
        status: a.status,
        count: 1,
        avgSecond: a.secondScore,
      })
    }
  }

  // 합산된 합계를 평균으로 변환
  const groups: GroupRow[] = []
  for (const [k, row] of groupMap) {
    const secondScoreItems = list.filter(
      (a) => `${a.period}::${a.status}` === k && a.secondScore != null
    )
    const avg =
      secondScoreItems.length > 0
        ? secondScoreItems.reduce((s, a) => s + (a.secondScore ?? 0), 0) /
          secondScoreItems.length
        : null
    groups.push({ ...row, avgSecond: avg })
  }
  groups.sort((a, b) =>
    a.period === b.period
      ? a.status.localeCompare(b.status)
      : b.period.localeCompare(a.period)
  )

  const totalCount = groups.reduce((s, g) => s + g.count, 0)

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
            <h2 className='text-2xl font-bold tracking-tight'>평가 진행현황</h2>
            <p className='text-muted-foreground'>
              06.평가 / 평가현황 — 기간×상태별 집계
            </p>
          </div>
          <div className='flex items-end gap-2'>
            <Input
              placeholder='평가기간 (예: 2025-상반기)'
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className='w-52'
            />
            <SelectDropdown
              defaultValue='ALL'
              onValueChange={(v) =>
                setStatus(v === 'ALL' ? undefined : (v as AppraisalStatus))
              }
              placeholder='상태'
              items={[{ label: '전체', value: 'ALL' }, ...STATUS_ITEMS]}
              className='w-28'
            />
          </div>
        </div>

        <div className='flex flex-wrap gap-4 text-sm'>
          <span>
            총 건수 <b>{totalCount}</b>
          </span>
          <span>
            그룹 수 <b>{groups.length}</b>
          </span>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-36'>평가기간</TableHead>
                <TableHead className='w-28'>상태</TableHead>
                <TableHead className='w-20 text-end'>건수</TableHead>
                <TableHead className='w-32 text-end'>평균 2차점수</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className='h-24 text-center'>
                    불러오는 중…
                  </TableCell>
                </TableRow>
              ) : groups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className='h-24 text-center'>
                    결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                groups.map((g) => (
                  <TableRow key={`${g.period}-${g.status}`}>
                    <TableCell>{g.period}</TableCell>
                    <TableCell>
                      <Badge variant='outline'>
                        {APPRAISAL_STATUS[g.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-end'>{g.count}</TableCell>
                    <TableCell className='text-end'>
                      {g.avgSecond != null ? g.avgSecond.toFixed(2) : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {groups.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2}>합계</TableCell>
                  <TableCell className='text-end font-semibold'>
                    {totalCount}
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
