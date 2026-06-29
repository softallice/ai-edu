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
  useVendorPayments,
  VENDOR_PAYMENT_STATUS,
  PAYMENT_METHOD,
  won,
  type VendorPaymentStatus,
} from './api'

const pad = (n: number) => String(n).padStart(2, '0')
const ymd = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

const STATUS_ITEMS = (
  Object.entries(VENDOR_PAYMENT_STATUS) as [VendorPaymentStatus, string][]
).map(([value, label]) => ({ label, value }))

export function VendorPaymentStatusPage() {
  const now = new Date()
  const [status, setStatus] = useState<VendorPaymentStatus | undefined>(
    undefined
  )
  const [dateFrom, setDateFrom] = useState(
    ymd(new Date(now.getFullYear(), 0, 1))
  )
  const [dateTo, setDateTo] = useState(ymd(new Date(now.getFullYear(), 11, 31)))

  const { data: rows, isLoading } = useVendorPayments({
    status,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  })
  const list = rows ?? []
  const amountTotal = list.reduce((s, r) => s + r.amount, 0)

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
            <h2 className='text-2xl font-bold tracking-tight'>대금지급현황</h2>
            <p className='text-muted-foreground'>
              03.구매 / 대금지급 — 기간·상태별 집계
            </p>
          </div>
          <div className='flex items-end gap-2'>
            <SelectDropdown
              defaultValue='ALL'
              onValueChange={(v) =>
                setStatus(v === 'ALL' ? undefined : (v as VendorPaymentStatus))
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

        <div className='flex flex-wrap gap-4 text-sm'>
          <span>
            건수 <b>{list.length}</b>
          </span>
          <span>
            지급액 합계 <b>{won(amountTotal)}</b> 원
          </span>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-36'>지급번호</TableHead>
                <TableHead>지급대상</TableHead>
                <TableHead className='w-32'>발주</TableHead>
                <TableHead className='w-28'>지급일</TableHead>
                <TableHead className='w-32 text-end'>지급액</TableHead>
                <TableHead className='w-20'>방법</TableHead>
                <TableHead className='w-20'>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className='h-24 text-center'>
                    불러오는 중…
                  </TableCell>
                </TableRow>
              ) : list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className='h-24 text-center'>
                    결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                list.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className='font-medium'>{p.code}</TableCell>
                    <TableCell>{p.supplierName}</TableCell>
                    <TableCell>{p.purchaseOrderCode ?? '-'}</TableCell>
                    <TableCell>{p.paymentDate ?? '-'}</TableCell>
                    <TableCell className='text-end'>{won(p.amount)}</TableCell>
                    <TableCell>
                      <Badge variant='outline'>
                        {PAYMENT_METHOD[p.method]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline'>
                        {VENDOR_PAYMENT_STATUS[p.status]}
                      </Badge>
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
                    {won(amountTotal)}
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
