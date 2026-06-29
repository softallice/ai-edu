import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
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
import { useAppraisals, APPRAISAL_STATUS, type Appraisal } from './api'

type EvaluateeRow = {
  employeeId: number
  employeeName: string
  departmentName: string | null
  latest: Appraisal
}

export function EvaluateePage() {
  const [period, setPeriod] = useState('')

  const { data: rows, isLoading } = useAppraisals({
    period: period || undefined,
  })

  const list = rows ?? []

  // 직원별 대표 1건(가장 최근 코드 기준)
  const empMap = new Map<number, EvaluateeRow>()
  for (const a of list) {
    const existing = empMap.get(a.employeeId)
    if (!existing || a.code > existing.latest.code) {
      empMap.set(a.employeeId, {
        employeeId: a.employeeId,
        employeeName: a.employeeName,
        departmentName: a.departmentName,
        latest: a,
      })
    }
  }
  const evaluatees = Array.from(empMap.values()).sort((a, b) =>
    a.employeeName.localeCompare(b.employeeName, 'ko')
  )

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
            <h2 className='text-2xl font-bold tracking-tight'>피평가자 현황</h2>
            <p className='text-muted-foreground'>
              06.평가 / 평가현황 — 직원별 평가 현황
            </p>
          </div>
          <div className='flex items-end gap-2'>
            <Input
              placeholder='평가기간 (예: 2025-상반기)'
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className='w-52'
            />
          </div>
        </div>

        <div className='flex flex-wrap gap-4 text-sm'>
          <span>
            직원 수 <b>{evaluatees.length}</b>
          </span>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-32'>직원</TableHead>
                <TableHead className='w-32'>부서</TableHead>
                <TableHead className='w-20 text-end'>본인점수</TableHead>
                <TableHead className='w-20 text-end'>1차점수</TableHead>
                <TableHead className='w-20 text-end'>2차점수</TableHead>
                <TableHead className='w-16'>등급</TableHead>
                <TableHead className='w-24'>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className='h-24 text-center'>
                    불러오는 중…
                  </TableCell>
                </TableRow>
              ) : evaluatees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className='h-24 text-center'>
                    결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                evaluatees.map((e) => (
                  <TableRow key={e.employeeId}>
                    <TableCell className='font-medium'>
                      {e.employeeName}
                    </TableCell>
                    <TableCell>{e.departmentName ?? '-'}</TableCell>
                    <TableCell className='text-end'>
                      {e.latest.selfScore ?? '-'}
                    </TableCell>
                    <TableCell className='text-end'>
                      {e.latest.firstScore ?? '-'}
                    </TableCell>
                    <TableCell className='text-end'>
                      {e.latest.secondScore ?? '-'}
                    </TableCell>
                    <TableCell>{e.latest.grade ?? '-'}</TableCell>
                    <TableCell>
                      <Badge variant='outline'>
                        {APPRAISAL_STATUS[e.latest.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Main>
    </>
  )
}
