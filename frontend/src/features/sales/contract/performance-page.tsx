import { Badge } from '@/components/ui/badge'
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
import { useContracts, CONTRACT_STATES, won, type ContractState } from './api'

export function ContractPerformancePage() {
  const { data: contracts, isLoading } = useContracts()
  const list = contracts ?? []
  const grandTotal = list.reduce((s, c) => s + c.totalAmount, 0)
  const byState = (Object.keys(CONTRACT_STATES) as ContractState[])
    .map((st) => {
      const items = list.filter((c) => c.state === st)
      return {
        state: st,
        count: items.length,
        amount: items.reduce((s, c) => s + c.totalAmount, 0),
      }
    })
    .filter((x) => x.count > 0)

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
          <h2 className='text-2xl font-bold tracking-tight'>계약실적 현황</h2>
          <p className='text-muted-foreground'>
            02.영업 / 계약관리 — 상태별 계약금액 집계
          </p>
        </div>

        <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
          <div className='rounded-md border p-4'>
            <div className='text-xs text-muted-foreground'>전체 계약</div>
            <div className='text-2xl font-bold'>{list.length}</div>
          </div>
          <div className='rounded-md border p-4 sm:col-span-3'>
            <div className='text-xs text-muted-foreground'>총 계약금액</div>
            <div className='text-2xl font-bold'>{won(grandTotal)} 원</div>
          </div>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>상태</TableHead>
                <TableHead className='w-24 text-end'>건수</TableHead>
                <TableHead className='w-40 text-end'>계약금액</TableHead>
                <TableHead className='w-24 text-end'>비중</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className='h-24 text-center'>
                    불러오는 중…
                  </TableCell>
                </TableRow>
              ) : byState.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className='h-24 text-center'>
                    계약이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                byState.map((s) => (
                  <TableRow key={s.state}>
                    <TableCell>
                      <Badge variant='outline'>
                        {CONTRACT_STATES[s.state]}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-end'>{s.count}</TableCell>
                    <TableCell className='text-end'>{won(s.amount)}</TableCell>
                    <TableCell className='text-end'>
                      {grandTotal > 0
                        ? Math.round((s.amount / grandTotal) * 100)
                        : 0}
                      %
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {byState.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell>합계</TableCell>
                  <TableCell className='text-end'>{list.length}</TableCell>
                  <TableCell className='text-end font-semibold'>
                    {won(grandTotal)}
                  </TableCell>
                  <TableCell className='text-end'>100%</TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-32'>계약번호</TableHead>
                <TableHead>계약명</TableHead>
                <TableHead>거래처</TableHead>
                <TableHead className='w-20'>상태</TableHead>
                <TableHead className='w-40 text-end'>계약금액</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className='font-medium'>{c.code}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.customerName}</TableCell>
                  <TableCell>
                    <Badge variant='outline'>{CONTRACT_STATES[c.state]}</Badge>
                  </TableCell>
                  <TableCell className='text-end'>
                    {won(c.totalAmount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Main>
    </>
  )
}
