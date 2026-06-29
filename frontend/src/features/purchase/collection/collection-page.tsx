import { useMemo, useState } from 'react'
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
import {
  useCollections,
  won,
  type ProjectCollection,
} from '@/features/sales/collection/api'

const pad = (n: number) => String(n).padStart(2, '0')
const ymd = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

type Row = {
  projectName: string
  customerName: string
  plannedAmount: number
  collectedAmount: number
  count: number
}

// 프로젝트(없으면 거래처) 단위로 수금 실적을 집계한다.
function aggregate(list: ProjectCollection[]): Row[] {
  const map = new Map<string, Row>()
  for (const c of list) {
    const projectName = c.projectName ?? '(미지정)'
    const k = `${projectName}|${c.customerName}`
    const row =
      map.get(k) ??
      ({
        projectName,
        customerName: c.customerName,
        plannedAmount: 0,
        collectedAmount: 0,
        count: 0,
      } satisfies Row)
    row.plannedAmount += c.amount
    if (c.status === 'COLLECTED') row.collectedAmount += c.amount
    row.count += 1
    map.set(k, row)
  }
  return [...map.values()].sort((a, b) =>
    a.projectName.localeCompare(b.projectName, 'ko-KR')
  )
}

const rate = (collected: number, planned: number) =>
  planned > 0 ? Math.round((collected / planned) * 100) : 0

export function PurchaseCollectionPage() {
  const now = new Date()
  const [dateFrom, setDateFrom] = useState(
    ymd(new Date(now.getFullYear(), 0, 1))
  )
  const [dateTo, setDateTo] = useState(ymd(new Date(now.getFullYear(), 11, 31)))

  const { data: rows, isLoading } = useCollections({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  })
  const list = rows ?? []
  const agg = useMemo(() => aggregate(list), [list])

  const plannedTotal = agg.reduce((s, r) => s + r.plannedAmount, 0)
  const collectedTotal = agg.reduce((s, r) => s + r.collectedAmount, 0)

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
              프로젝트수금실적현황
            </h2>
            <p className='text-muted-foreground'>
              03.구매 / 프로젝트별 수금 계획 대비 실적 (조회 전용)
            </p>
          </div>
          <div className='flex items-end gap-2'>
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
            프로젝트 <b>{agg.length}</b>
          </span>
          <span>
            수금예정 <b>{won(plannedTotal)}</b>
          </span>
          <span>
            수금실적 <b>{won(collectedTotal)}</b>
          </span>
          <span>
            달성률 <b>{rate(collectedTotal, plannedTotal)}%</b>
          </span>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>프로젝트</TableHead>
                <TableHead>거래처</TableHead>
                <TableHead className='w-20 text-end'>건수</TableHead>
                <TableHead className='w-36 text-end'>수금예정</TableHead>
                <TableHead className='w-36 text-end'>수금실적</TableHead>
                <TableHead className='w-24 text-end'>달성률</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className='h-24 text-center'>
                    불러오는 중…
                  </TableCell>
                </TableRow>
              ) : agg.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className='h-24 text-center'>
                    결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                agg.map((r) => (
                  <TableRow key={`${r.projectName}|${r.customerName}`}>
                    <TableCell className='font-medium'>
                      {r.projectName}
                    </TableCell>
                    <TableCell>{r.customerName}</TableCell>
                    <TableCell className='text-end'>{r.count}</TableCell>
                    <TableCell className='text-end'>
                      {won(r.plannedAmount)}
                    </TableCell>
                    <TableCell className='text-end'>
                      {won(r.collectedAmount)}
                    </TableCell>
                    <TableCell className='text-end'>
                      {rate(r.collectedAmount, r.plannedAmount)}%
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {agg.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3}>합계</TableCell>
                  <TableCell className='text-end font-semibold'>
                    {won(plannedTotal)}
                  </TableCell>
                  <TableCell className='text-end font-semibold'>
                    {won(collectedTotal)}
                  </TableCell>
                  <TableCell className='text-end font-semibold'>
                    {rate(collectedTotal, plannedTotal)}%
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
