import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
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
import { SelectDropdown } from '@/components/select-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { useCustomers } from '@/features/customers/api'
import {
  useVendorBills,
  useSaveVendorBill,
  useDeleteVendorBill,
  usePurchaseOrdersForBill,
  VENDOR_BILL_STATUS,
  won,
  type VendorBill,
  type VendorBillInput,
  type VendorBillStatus,
} from './api'

const EMPTY: VendorBillInput = {
  supplierId: 0,
  purchaseOrderId: null,
  billType: 'GOODS',
  issueDate: '',
  supplyAmount: 0,
  taxAmount: 0,
  status: 'DRAFT',
  note: '',
}

const STATE_ITEMS = (
  Object.entries(VENDOR_BILL_STATUS) as [VendorBillStatus, string][]
).map(([value, label]) => ({ label, value }))

export function VendorBillGoodsPage() {
  const [keyword, setKeyword] = useState('')
  const { data: rows, isLoading } = useVendorBills({
    billType: 'GOODS',
    keyword: keyword || undefined,
  })
  const { data: customers } = useCustomers()
  const { data: purchaseOrders } = usePurchaseOrdersForBill()
  const save = useSaveVendorBill()
  const remove = useDeleteVendorBill()

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | undefined>(undefined)
  const [form, setForm] = useState<VendorBillInput>(EMPTY)

  const supplierItems = (customers ?? []).map((c) => ({
    label: `${c.name} (${c.code})`,
    value: String(c.id),
  }))
  const orderItems = (purchaseOrders ?? []).map((o) => ({
    label: `${o.code} (${o.supplierName})`,
    value: String(o.id),
  }))

  const set = (k: keyof VendorBillInput, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }))
  const onSupply = (v: number) =>
    setForm((f) => ({ ...f, supplyAmount: v, taxAmount: Math.round(v * 0.1) }))
  const formTotal =
    (Number(form.supplyAmount) || 0) + (Number(form.taxAmount) || 0)

  const openCreate = () => {
    setEditId(undefined)
    setForm({ ...EMPTY, supplierId: customers?.[0]?.id ?? 0 })
    setOpen(true)
  }
  const openEdit = (b: VendorBill) => {
    setEditId(b.id)
    setForm({
      supplierId: b.supplierId,
      purchaseOrderId: b.purchaseOrderId,
      billType: 'GOODS',
      issueDate: b.issueDate ?? '',
      supplyAmount: b.supplyAmount,
      taxAmount: b.taxAmount,
      status: b.status,
      note: b.note ?? '',
    })
    setOpen(true)
  }
  const submit = () => {
    if (!form.supplierId || !(form.supplyAmount > 0)) {
      toast.error('매입처와 공급가액(0 초과)은 필수입니다.')
      return
    }
    save.mutate(
      {
        id: editId,
        body: {
          ...form,
          billType: 'GOODS',
          issueDate: form.issueDate || null,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            editId
              ? '매입세금계산서를 수정했습니다.'
              : '매입세금계산서를 등록했습니다.'
          )
          setOpen(false)
        },
        onError: () => toast.error('저장에 실패했습니다.'),
      }
    )
  }
  const onDelete = (b: VendorBill) => {
    if (!confirm(`매입세금계산서 [${b.code}]을(를) 삭제하시겠습니까?`)) return
    remove.mutate(b.id, {
      onSuccess: () => toast.success('삭제했습니다.'),
      onError: () => toast.error('삭제에 실패했습니다.'),
    })
  }

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
              상품매입세금계산서
            </h2>
            <p className='text-muted-foreground'>
              03.구매 / 매입세금계산서 — 상품
            </p>
          </div>
          <div className='flex items-end gap-2'>
            <Input
              placeholder='계산서번호 검색'
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className='w-48'
            />
            <Button onClick={openCreate}>
              <Plus size={16} /> 매입계산서 등록
            </Button>
          </div>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-36'>계산서번호</TableHead>
                <TableHead>매입처</TableHead>
                <TableHead className='w-32'>발주</TableHead>
                <TableHead className='w-28'>발행일</TableHead>
                <TableHead className='w-32 text-end'>공급가액</TableHead>
                <TableHead className='w-28 text-end'>세액</TableHead>
                <TableHead className='w-32 text-end'>합계</TableHead>
                <TableHead className='w-20'>상태</TableHead>
                <TableHead className='w-24 text-end'>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className='h-24 text-center'>
                    불러오는 중…
                  </TableCell>
                </TableRow>
              ) : (rows ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className='h-24 text-center'>
                    결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                (rows ?? []).map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className='font-medium'>{b.code}</TableCell>
                    <TableCell>{b.supplierName}</TableCell>
                    <TableCell>{b.purchaseOrderCode ?? '-'}</TableCell>
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
                    <TableCell className='text-end'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => openEdit(b)}
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => onDelete(b)}
                      >
                        <Trash2 size={15} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Main>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className='flex flex-col'>
          <SheetHeader>
            <SheetTitle>
              {editId ? '매입세금계산서 수정' : '상품매입세금계산서 등록'}
            </SheetTitle>
          </SheetHeader>
          <div className='flex-1 space-y-4 overflow-y-auto px-4'>
            <Field label='매입처'>
              <SelectDropdown
                defaultValue={form.supplierId ? String(form.supplierId) : ''}
                onValueChange={(v) => set('supplierId', v ? Number(v) : 0)}
                placeholder='매입처 선택'
                items={supplierItems}
              />
            </Field>
            <Field label='발주 (선택)'>
              <SelectDropdown
                defaultValue={
                  form.purchaseOrderId ? String(form.purchaseOrderId) : ''
                }
                onValueChange={(v) =>
                  set('purchaseOrderId', v ? Number(v) : null)
                }
                placeholder='연결 발주(선택)'
                items={orderItems}
              />
            </Field>
            <Field label='발행일'>
              <Input
                type='date'
                value={form.issueDate ?? ''}
                onChange={(e) => set('issueDate', e.target.value)}
              />
            </Field>
            <Field label='공급가액'>
              <Input
                type='number'
                value={form.supplyAmount}
                onChange={(e) => onSupply(Number(e.target.value))}
              />
            </Field>
            <Field label='세액 (공급가액의 10% 자동 · 수정 가능)'>
              <Input
                type='number'
                value={form.taxAmount ?? 0}
                onChange={(e) => set('taxAmount', Number(e.target.value))}
              />
            </Field>
            <div className='text-end text-sm'>
              합계 <b>{won(formTotal)}</b> 원
            </div>
            <Field label='상태'>
              <SelectDropdown
                defaultValue={form.status}
                onValueChange={(v) => set('status', v)}
                placeholder='상태'
                items={STATE_ITEMS}
              />
            </Field>
            <Field label='비고'>
              <Input
                value={form.note ?? ''}
                onChange={(e) => set('note', e.target.value)}
              />
            </Field>
          </div>
          <SheetFooter className='gap-2'>
            <SheetClose asChild>
              <Button variant='outline'>닫기</Button>
            </SheetClose>
            <Button onClick={submit} disabled={save.isPending}>
              저장
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className='space-y-1'>
      <label className='text-sm font-medium'>{label}</label>
      {children}
    </div>
  )
}
