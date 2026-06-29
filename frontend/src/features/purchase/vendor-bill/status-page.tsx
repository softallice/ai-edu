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
  useVendorBills,
  VENDOR_BILL_STATUS,
  VENDOR_BILL_TYPE,
  won,
  type VendorBillStatus,
  type VendorBillType,
} from './api'

const pad = (n: number) => String(n).padStart(2, '0')
const ymd = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

const STATE_ITEMS = (
  Object.entries(VENDOR_BILL_STATUS) as [VendorBillStatus, string][]
).map(([value, label]) => ({ label, value }))

const TYPE_ITEMS = (
  Object.entries(VENDOR_BILL_TYPE) as [VendorBillType, string][]
).map(([value, label]) => ({ label, value }))

export function VendorBillStatusPage() {
  const now = new Date()
  const [status, setStatus] = useState<VendorBillStatus | undefined>(undefined)
  const [billType, setBillType] = useState<VendorBillType | undefined>(
    undefined
  )
  const [dateFrom, setDateFrom] = useState(
    ymd(new Date(now.getFullYear(), 0, 1))
  )
  const [dateTo, setDateTo] = useState(ymd(new Date(now.getFullYear(), 11, 31)))

  const { data: rows, isLoading } = useVendorBills({
    status,
    billType,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  })
  const list = rows ?? []
  const supplyTotal = list.reduce((s, r) => s + r.supplyAmount, 0)
  const taxTotal = list.reduce((s, r) => s + r.taxAmount, 0)
  const grandTotal = list.reduce((s, r) => s + r.totalAmount, 0)

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
              매입세금계산서 현황
            </h2>
            <p className='text-muted-foreground'>
              03.구매 / 매입세금계산서 — 기간·상태·유형별 집계
            </p>
          </div>
          <div className='flex items-end gap-2'>
            <SelectDropdown
              defaultValue='ALL'
              onValueChange={(v) =>
                setBillType(v === 'ALL' ? undefined : (v as VendorBillType))
              }
              placeholder='유형'
              items={[{ label: '전체', value: 'ALL' }, ...TYPE_ITEMS]}
              className='w-28'
            />
            <SelectDropdown
              defaultValue='ALL'
              onValueChange={(v) =>
                setStatus(v === 'ALL' ? undefined : (v as VendorBillStatus))
              }
              placeholder='상태'
              items={[{ label: '전체', value: 'ALL' }, ...STATE_ITEMS]}
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
            공급가액 <b>{won(supplyTotal)}</b>
          </span>
          <span>
            세액 <b>{won(taxTotal)}</b>
          </span>
          <span>
            합계 <b>{won(grandTotal)}</b> 원
          </span>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-36'>계산서번호</TableHead>
                <TableHead>매입처</TableHead>
                <TableHead className='w-32'>발주</TableHead>
                <TableHead className='w-20'>유형</TableHead>
                <TableHead className='w-28'>발행일</TableHead>
                <TableHead className='w-32 text-end'>공급가액</TableHead>
                <TableHead className='w-28 text-end'>세액</TableHead>
                <TableHead className='w-32 text-end'>합계</TableHead>
                <TableHead className='w-20'>상태</TableHead>
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
                list.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className='font-medium'>{b.code}</TableCell>
                    <TableCell>{b.supplierName}</TableCell>
                    <TableCell>{b.purchaseOrderCode ?? '-'}</TableCell>
                    <TableCell>{VENDOR_BILL_TYPE[b.billType]}</TableCell>
                    <TableCell>{b.issueDate ?? '-'}</TableCell>
                    <TableCell className='text-end'>
                      {won(b.supplyAmount)}
                    </TableCell>
                    <TableCell className='text-end'>
                      {won(b.taxAmount)}
                    </TableCell>
                    <TableCell className='text-end'>
                      {won(b.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline'>
                        {VENDOR_BILL_STATUS[b.status]}
                      </Badge>
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
                    {won(supplyTotal)}
                  </TableCell>
                  <TableCell className='text-end font-semibold'>
                    {won(taxTotal)}
                  </TableCell>
                  <TableCell className='text-end font-semibold'>
                    {won(grandTotal)}
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
