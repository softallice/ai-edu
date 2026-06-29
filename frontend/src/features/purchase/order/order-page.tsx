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
  usePurchaseOrders,
  useSavePurchaseOrder,
  useDeletePurchaseOrder,
  useProjects,
  PURCHASE_ORDER_STATUS,
  won,
  type PurchaseOrder,
  type PurchaseOrderInput,
  type PurchaseOrderStatus,
} from './api'

const EMPTY: PurchaseOrderInput = {
  supplierId: 0,
  projectId: null,
  orderDate: '',
  deliveryDate: '',
  amount: 0,
  status: 'DRAFT',
  note: '',
}

const STATUS_ITEMS = (
  Object.entries(PURCHASE_ORDER_STATUS) as [PurchaseOrderStatus, string][]
).map(([value, label]) => ({ label, value }))

export function PurchaseOrderPage() {
  const [keyword, setKeyword] = useState('')
  const { data: rows, isLoading } = usePurchaseOrders({
    keyword: keyword || undefined,
  })
  const { data: customers } = useCustomers()
  const { data: projects } = useProjects()
  const save = useSavePurchaseOrder()
  const remove = useDeletePurchaseOrder()

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | undefined>(undefined)
  const [form, setForm] = useState<PurchaseOrderInput>(EMPTY)

  const supplierItems = (customers ?? []).map((c) => ({
    label: `${c.name} (${c.code})`,
    value: String(c.id),
  }))
  const projectItems = (projects ?? []).map((p) => ({
    label: `${p.code} ${p.name}`,
    value: String(p.id),
  }))

  const set = (k: keyof PurchaseOrderInput, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }))

  const totalCount = (rows ?? []).length
  const totalAmount = (rows ?? []).reduce((sum, r) => sum + r.amount, 0)

  const openCreate = () => {
    setEditId(undefined)
    setForm({ ...EMPTY, supplierId: customers?.[0]?.id ?? 0 })
    setOpen(true)
  }
  const openEdit = (o: PurchaseOrder) => {
    setEditId(o.id)
    setForm({
      supplierId: o.supplierId,
      projectId: o.projectId,
      orderDate: o.orderDate ?? '',
      deliveryDate: o.deliveryDate ?? '',
      amount: o.amount,
      status: o.status,
      note: o.note ?? '',
    })
    setOpen(true)
  }
  const submit = () => {
    if (!form.supplierId || !(form.amount > 0)) {
      toast.error('공급처와 금액(0 초과)은 필수입니다.')
      return
    }
    save.mutate(
      {
        id: editId,
        body: {
          ...form,
          orderDate: form.orderDate || null,
          deliveryDate: form.deliveryDate || null,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            editId ? '발주를 수정했습니다.' : '발주를 등록했습니다.'
          )
          setOpen(false)
        },
        onError: () => toast.error('저장에 실패했습니다.'),
      }
    )
  }
  const onDelete = (o: PurchaseOrder) => {
    if (!confirm(`발주 [${o.code}]을(를) 삭제하시겠습니까?`)) return
    remove.mutate(o.id, {
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
            <h2 className='text-2xl font-bold tracking-tight'>구매발주</h2>
            <p className='text-muted-foreground'>03.구매 / 발주</p>
          </div>
          <div className='flex items-end gap-2'>
            <Input
              placeholder='발주번호 검색'
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className='w-48'
            />
            <Button onClick={openCreate}>
              <Plus size={16} /> 발주 등록
            </Button>
          </div>
        </div>

        {/* 요약 */}
        <div className='flex gap-6 rounded-md border px-4 py-3 text-sm'>
          <span>
            총 발주 건수 <b>{totalCount}</b> 건
          </span>
          <span>
            발주 금액 합계 <b>{won(totalAmount)}</b> 원
          </span>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-36'>발주번호</TableHead>
                <TableHead>공급처</TableHead>
                <TableHead>프로젝트</TableHead>
                <TableHead className='w-28'>발주일</TableHead>
                <TableHead className='w-28'>납기일</TableHead>
                <TableHead className='w-36 text-end'>금액</TableHead>
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
                (rows ?? []).map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className='font-medium'>{o.code}</TableCell>
                    <TableCell>{o.supplierName}</TableCell>
                    <TableCell>{o.projectName ?? '-'}</TableCell>
                    <TableCell>{o.orderDate ?? '-'}</TableCell>
                    <TableCell>{o.deliveryDate ?? '-'}</TableCell>
                    <TableCell className='text-end'>{won(o.amount)}</TableCell>
                    <TableCell>
                      <Badge variant='outline'>
                        {PURCHASE_ORDER_STATUS[o.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-end'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => openEdit(o)}
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => onDelete(o)}
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
            <SheetTitle>{editId ? '발주 수정' : '발주 등록'}</SheetTitle>
          </SheetHeader>
          <div className='flex-1 space-y-4 overflow-y-auto px-4'>
            <Field label='공급처'>
              <SelectDropdown
                defaultValue={form.supplierId ? String(form.supplierId) : ''}
                onValueChange={(v) => set('supplierId', v ? Number(v) : 0)}
                placeholder='공급처 선택'
                items={supplierItems}
              />
            </Field>
            <Field label='프로젝트'>
              <SelectDropdown
                defaultValue={form.projectId ? String(form.projectId) : ''}
                onValueChange={(v) => set('projectId', v ? Number(v) : null)}
                placeholder='연결 프로젝트(선택)'
                items={projectItems}
              />
            </Field>
            <Field label='발주일'>
              <Input
                type='date'
                value={form.orderDate ?? ''}
                onChange={(e) => set('orderDate', e.target.value)}
              />
            </Field>
            <Field label='납기일'>
              <Input
                type='date'
                value={form.deliveryDate ?? ''}
                onChange={(e) => set('deliveryDate', e.target.value)}
              />
            </Field>
            <Field label='금액'>
              <Input
                type='number'
                value={form.amount}
                onChange={(e) => set('amount', Number(e.target.value))}
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
