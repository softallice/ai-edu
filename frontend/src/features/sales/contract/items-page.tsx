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
  useContractLines,
  CONTRACT_STATES,
  won,
  type ContractState,
} from './api'

const STATE_ITEMS = (
  Object.entries(CONTRACT_STATES) as [ContractState, string][]
).map(([value, label]) => ({ label, value }))

export function ContractItemsPage() {
  const [keyword, setKeyword] = useState('')
  const [stateFilter, setStateFilter] = useState<ContractState | undefined>(
    undefined
  )
  const { data: rows, isLoading } = useContractLines(
    keyword || undefined,
    stateFilter
  )
  const list = rows ?? []
  const total = list.reduce((s, r) => s + r.amount, 0)

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
            <h2 className='text-2xl font-bold tracking-tight'>계약품목 현황</h2>
            <p className='text-muted-foreground'>
              02.영업 / 계약관리 — 계약별 품목 집계
            </p>
          </div>
          <div className='flex items-end gap-2'>
            <SelectDropdown
              defaultValue='ALL'
              onValueChange={(v) =>
                setStateFilter(v === 'ALL' ? undefined : (v as ContractState))
              }
              placeholder='상태'
              items={[{ label: '전체', value: 'ALL' }, ...STATE_ITEMS]}
              className='w-28'
            />
            <Input
              placeholder='계약명·번호 검색'
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className='w-48'
            />
          </div>
        </div>

        <div className='flex flex-wrap gap-4 text-sm'>
          <span>
            품목 <b>{list.length}</b>
          </span>
          <span>
            금액 합계 <b>{won(total)}</b> 원
          </span>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-32'>계약번호</TableHead>
                <TableHead>계약명</TableHead>
                <TableHead>거래처</TableHead>
                <TableHead className='w-20'>상태</TableHead>
                <TableHead>품목명</TableHead>
                <TableHead className='w-24'>규격</TableHead>
                <TableHead className='w-16 text-end'>수량</TableHead>
                <TableHead className='w-28 text-end'>단가</TableHead>
                <TableHead className='w-32 text-end'>금액</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className='h-24 text-center'>
                    불러오는 중…
                  </TableCell>
                </TableRow>
              ) : list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className='h-24 text-center'>
                    결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                list.map((r) => (
                  <TableRow key={r.lineId}>
                    <TableCell className='font-medium'>
                      {r.contractCode}
                    </TableCell>
                    <TableCell>{r.contractName}</TableCell>
                    <TableCell>{r.customerName}</TableCell>
                    <TableCell>
                      <Badge variant='outline'>
                        {CONTRACT_STATES[r.state]}
                      </Badge>
                    </TableCell>
                    <TableCell>{r.itemName}</TableCell>
                    <TableCell>{r.spec ?? '-'}</TableCell>
                    <TableCell className='text-end'>{r.quantity}</TableCell>
                    <TableCell className='text-end'>
                      {won(r.unitPrice)}
                    </TableCell>
                    <TableCell className='text-end'>{won(r.amount)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {list.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={8}>합계</TableCell>
                  <TableCell className='text-end font-semibold'>
                    {won(total)}
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
