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
import {
  usePurchaseRequests,
  useSavePurchaseRequest,
  useDeletePurchaseRequest,
  useEmployees,
  useProjects,
  PURCHASE_REQUEST_STATUS,
  won,
  type PurchaseRequest,
  type PurchaseRequestInput,
  type PurchaseRequestStatus,
} from './api'

const EMPTY: PurchaseRequestInput = {
  projectId: null,
  requesterId: null,
  requestDate: '',
  itemName: '',
  quantity: null,
  estimatedAmount: 0,
  status: 'REQUESTED',
  note: '',
}

const STATUS_ITEMS = (
  Object.entries(PURCHASE_REQUEST_STATUS) as [PurchaseRequestStatus, string][]
).map(([value, label]) => ({ label, value }))

export function PurchaseRequestPage() {
  const [keyword, setKeyword] = useState('')
  const { data: rows, isLoading } = usePurchaseRequests({
    keyword: keyword || undefined,
  })
  const { data: employees } = useEmployees()
  const { data: projects } = useProjects()
  const save = useSavePurchaseRequest()
  const remove = useDeletePurchaseRequest()

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | undefined>(undefined)
  const [form, setForm] = useState<PurchaseRequestInput>(EMPTY)

  const employeeItems = (employees ?? []).map((e) => ({
    label: `${e.name} (${e.employeeNo})`,
    value: String(e.id),
  }))
  const projectItems = (projects ?? []).map((p) => ({
    label: `${p.code} ${p.name}`,
    value: String(p.id),
  }))

  const set = (k: keyof PurchaseRequestInput, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }))

  const openCreate = () => {
    setEditId(undefined)
    setForm(EMPTY)
    setOpen(true)
  }
  const openEdit = (r: PurchaseRequest) => {
    setEditId(r.id)
    setForm({
      projectId: r.projectId,
      requesterId: r.requesterId,
      requestDate: r.requestDate ?? '',
      itemName: r.itemName,
      quantity: r.quantity,
      estimatedAmount: r.estimatedAmount,
      status: r.status,
      note: r.note ?? '',
    })
    setOpen(true)
  }
  const submit = () => {
    if (!form.itemName.trim()) {
      toast.error('품목명은 필수입니다.')
      return
    }
    save.mutate(
      {
        id: editId,
        body: {
          ...form,
          requestDate: form.requestDate || null,
        },
      },
      {
        onSuccess: () => {
          toast.success(editId ? '수정했습니다.' : '구매의뢰를 등록했습니다.')
          setOpen(false)
        },
        onError: () => toast.error('저장에 실패했습니다.'),
      }
    )
  }
  const onDelete = (r: PurchaseRequest) => {
    if (!confirm(`구매의뢰 [${r.code}]을(를) 삭제하시겠습니까?`)) return
    remove.mutate(r.id, {
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
            <h2 className='text-2xl font-bold tracking-tight'>구매의뢰</h2>
            <p className='text-muted-foreground'>02.영업 / 구매의뢰</p>
          </div>
          <div className='flex items-end gap-2'>
            <Input
              placeholder='코드·품목명 검색'
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className='w-44'
            />
            <Button onClick={openCreate}>
              <Plus size={16} /> 의뢰 등록
            </Button>
          </div>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-32'>코드</TableHead>
                <TableHead>품목명</TableHead>
                <TableHead className='w-28'>의뢰일</TableHead>
                <TableHead className='w-28'>의뢰자</TableHead>
                <TableHead className='w-16 text-end'>수량</TableHead>
                <TableHead className='w-32 text-end'>예상금액</TableHead>
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
                (rows ?? []).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className='font-medium'>{r.code}</TableCell>
                    <TableCell>{r.itemName}</TableCell>
                    <TableCell>{r.requestDate ?? '-'}</TableCell>
                    <TableCell>{r.requesterName ?? '-'}</TableCell>
                    <TableCell className='text-end'>
                      {r.quantity ?? '-'}
                    </TableCell>
                    <TableCell className='text-end'>
                      {won(r.estimatedAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline'>
                        {PURCHASE_REQUEST_STATUS[r.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-end'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => openEdit(r)}
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => onDelete(r)}
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
              {editId ? '구매의뢰 수정' : '구매의뢰 등록'}
            </SheetTitle>
          </SheetHeader>
          <div className='flex-1 space-y-4 overflow-y-auto px-4'>
            <Field label='품목명'>
              <Input
                value={form.itemName}
                onChange={(e) => set('itemName', e.target.value)}
                placeholder='품목명 입력'
              />
            </Field>
            <Field label='프로젝트 (선택)'>
              <SelectDropdown
                defaultValue={form.projectId ? String(form.projectId) : ''}
                onValueChange={(v) => set('projectId', v ? Number(v) : null)}
                placeholder='프로젝트 선택'
                items={projectItems}
              />
            </Field>
            <Field label='의뢰자 (선택)'>
              <SelectDropdown
                defaultValue={form.requesterId ? String(form.requesterId) : ''}
                onValueChange={(v) => set('requesterId', v ? Number(v) : null)}
                placeholder='직원 선택'
                items={employeeItems}
              />
            </Field>
            <Field label='의뢰일'>
              <Input
                type='date'
                value={form.requestDate ?? ''}
                onChange={(e) => set('requestDate', e.target.value)}
              />
            </Field>
            <Field label='수량'>
              <Input
                type='number'
                value={form.quantity ?? ''}
                onChange={(e) =>
                  set(
                    'quantity',
                    e.target.value ? Number(e.target.value) : null
                  )
                }
              />
            </Field>
            <Field label='예상 금액'>
              <Input
                type='number'
                value={form.estimatedAmount ?? 0}
                onChange={(e) => set('estimatedAmount', Number(e.target.value))}
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
