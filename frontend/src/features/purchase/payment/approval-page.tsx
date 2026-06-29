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
  useVendorPayments,
  useSaveVendorPayment,
  useDeleteVendorPayment,
  usePurchaseOrders,
  VENDOR_PAYMENT_STATUS,
  PAYMENT_METHOD,
  won,
  type VendorPayment,
  type VendorPaymentInput,
  type VendorPaymentStatus,
  type PaymentMethod,
} from './api'

const EMPTY: VendorPaymentInput = {
  supplierId: 0,
  purchaseOrderId: null,
  paymentDate: '',
  amount: 0,
  method: 'TRANSFER',
  status: 'REQUESTED',
  note: '',
}

const STATUS_ITEMS = (
  Object.entries(VENDOR_PAYMENT_STATUS) as [VendorPaymentStatus, string][]
).map(([value, label]) => ({ label, value }))

const METHOD_ITEMS = (
  Object.entries(PAYMENT_METHOD) as [PaymentMethod, string][]
).map(([value, label]) => ({ label, value }))

export function VendorPaymentApprovalPage() {
  const [keyword, setKeyword] = useState('')
  const { data: rows, isLoading } = useVendorPayments({
    keyword: keyword || undefined,
  })
  const { data: customers } = useCustomers()
  const { data: purchaseOrders } = usePurchaseOrders()
  const save = useSaveVendorPayment()
  const remove = useDeleteVendorPayment()

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | undefined>(undefined)
  const [form, setForm] = useState<VendorPaymentInput>(EMPTY)

  const custItems = (customers ?? []).map((c) => ({
    label: `${c.name} (${c.code})`,
    value: String(c.id),
  }))
  const orderItems = (purchaseOrders ?? []).map((o) => ({
    label: `${o.code} (${o.supplierName})`,
    value: String(o.id),
  }))

  const set = (k: keyof VendorPaymentInput, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }))

  const openCreate = () => {
    setEditId(undefined)
    setForm({ ...EMPTY, supplierId: customers?.[0]?.id ?? 0 })
    setOpen(true)
  }
  const openEdit = (p: VendorPayment) => {
    setEditId(p.id)
    setForm({
      supplierId: p.supplierId,
      purchaseOrderId: p.purchaseOrderId,
      paymentDate: p.paymentDate ?? '',
      amount: p.amount,
      method: p.method,
      status: p.status,
      note: p.note ?? '',
    })
    setOpen(true)
  }
  const submit = () => {
    if (!form.supplierId || !(form.amount > 0)) {
      toast.error('지급대상 거래처와 지급액(0 초과)은 필수입니다.')
      return
    }
    save.mutate(
      { id: editId, body: { ...form, paymentDate: form.paymentDate || null } },
      {
        onSuccess: () => {
          toast.success(
            editId ? '대금지급을 수정했습니다.' : '대금지급을 등록했습니다.'
          )
          setOpen(false)
        },
        onError: () => toast.error('저장에 실패했습니다.'),
      }
    )
  }
  const onDelete = (p: VendorPayment) => {
    if (!confirm(`대금지급 [${p.code}]을(를) 삭제하시겠습니까?`)) return
    remove.mutate(p.id, {
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
            <h2 className='text-2xl font-bold tracking-tight'>대금지급결재</h2>
            <p className='text-muted-foreground'>03.구매 / 대금지급 — 결재</p>
          </div>
          <div className='flex items-end gap-2'>
            <Input
              placeholder='지급번호 검색'
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className='w-48'
            />
            <Button onClick={openCreate}>
              <Plus size={16} /> 대금지급 등록
            </Button>
          </div>
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
                <TableHead className='w-24 text-end'>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className='h-24 text-center'>
                    불러오는 중…
                  </TableCell>
                </TableRow>
              ) : (rows ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className='h-24 text-center'>
                    결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                (rows ?? []).map((p) => (
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
                    <TableCell className='text-end'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => openEdit(p)}
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => onDelete(p)}
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
              {editId ? '대금지급 수정' : '대금지급 등록'}
            </SheetTitle>
          </SheetHeader>
          <div className='flex-1 space-y-4 overflow-y-auto px-4'>
            <Field label='지급대상 거래처'>
              <SelectDropdown
                defaultValue={form.supplierId ? String(form.supplierId) : ''}
                onValueChange={(v) => set('supplierId', v ? Number(v) : 0)}
                placeholder='거래처 선택'
                items={custItems}
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
            <Field label='지급일'>
              <Input
                type='date'
                value={form.paymentDate ?? ''}
                onChange={(e) => set('paymentDate', e.target.value)}
              />
            </Field>
            <Field label='지급액'>
              <Input
                type='number'
                value={form.amount}
                onChange={(e) => set('amount', Number(e.target.value))}
              />
            </Field>
            <Field label='지급방법'>
              <SelectDropdown
                defaultValue={form.method}
                onValueChange={(v) => set('method', v)}
                placeholder='지급방법'
                items={METHOD_ITEMS}
              />
            </Field>
            <Field label='상태'>
              <SelectDropdown
                defaultValue={form.status}
                onValueChange={(v) => set('status', v)}
                placeholder='상태'
                items={STATUS_ITEMS}
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
