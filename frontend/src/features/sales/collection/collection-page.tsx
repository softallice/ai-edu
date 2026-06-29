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
import { useContracts } from '@/features/sales/contract/api'
import {
  useCollections,
  useSaveCollection,
  useDeleteCollection,
  COLLECTION_METHOD,
  COLLECTION_STATUS,
  won,
  type ProjectCollection,
  type ProjectCollectionInput,
  type CollectionMethod,
  type CollectionStatus,
} from './api'

const EMPTY: ProjectCollectionInput = {
  customerId: 0,
  contractId: null,
  projectId: null,
  plannedDate: '',
  collectDate: '',
  amount: 0,
  method: 'TRANSFER',
  status: 'PLANNED',
  note: '',
}

const METHOD_ITEMS = (
  Object.entries(COLLECTION_METHOD) as [CollectionMethod, string][]
).map(([value, label]) => ({ label, value }))

const STATUS_ITEMS = (
  Object.entries(COLLECTION_STATUS) as [CollectionStatus, string][]
).map(([value, label]) => ({ label, value }))

export function CollectionPage() {
  const [keyword, setKeyword] = useState('')
  const { data: rows, isLoading } = useCollections({
    keyword: keyword || undefined,
  })
  const { data: customers } = useCustomers()
  const { data: contracts } = useContracts()
  const save = useSaveCollection()
  const remove = useDeleteCollection()

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | undefined>(undefined)
  const [form, setForm] = useState<ProjectCollectionInput>(EMPTY)

  const custItems = (customers ?? []).map((c) => ({
    label: `${c.name} (${c.code})`,
    value: String(c.id),
  }))
  const contractItems = (contracts ?? []).map((c) => ({
    label: `${c.code} ${c.name}`,
    value: String(c.id),
  }))

  const set = (k: keyof ProjectCollectionInput, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }))

  // 상단 요약
  const totalCount = (rows ?? []).length
  const plannedTotal = (rows ?? []).reduce(
    (s, r) => s + (r.status === 'PLANNED' ? r.amount : 0),
    0
  )
  const collectedTotal = (rows ?? []).reduce(
    (s, r) => s + (r.status === 'COLLECTED' ? r.amount : 0),
    0
  )

  const openCreate = () => {
    setEditId(undefined)
    setForm({ ...EMPTY, customerId: customers?.[0]?.id ?? 0 })
    setOpen(true)
  }
  const openEdit = (c: ProjectCollection) => {
    setEditId(c.id)
    setForm({
      customerId: c.customerId,
      contractId: c.contractId,
      projectId: c.projectId,
      plannedDate: c.plannedDate ?? '',
      collectDate: c.collectDate ?? '',
      amount: c.amount,
      method: c.method,
      status: c.status,
      note: c.note ?? '',
    })
    setOpen(true)
  }
  const submit = () => {
    if (!form.customerId || !(form.amount > 0)) {
      toast.error('거래처와 금액(0 초과)은 필수입니다.')
      return
    }
    save.mutate(
      {
        id: editId,
        body: {
          ...form,
          plannedDate: form.plannedDate || null,
          collectDate: form.collectDate || null,
        },
      },
      {
        onSuccess: () => {
          toast.success(editId ? '수정했습니다.' : '수금 내역을 추가했습니다.')
          setOpen(false)
        },
        onError: () => toast.error('저장에 실패했습니다.'),
      }
    )
  }
  const onDelete = (c: ProjectCollection) => {
    if (!confirm(`수금 [${c.code}]을(를) 삭제하시겠습니까?`)) return
    remove.mutate(c.id, {
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
            <h2 className='text-2xl font-bold tracking-tight'>프로젝트수금</h2>
            <p className='text-muted-foreground'>02.영업 / 프로젝트수금</p>
          </div>
          <div className='flex items-end gap-2'>
            <Input
              placeholder='코드 검색'
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className='w-40'
            />
            <Button onClick={openCreate}>
              <Plus size={16} /> 수금 추가
            </Button>
          </div>
        </div>

        {/* 요약 */}
        <div className='flex gap-6 rounded-md border px-4 py-3 text-sm'>
          <span>
            총 <b>{totalCount}</b> 건
          </span>
          <span>
            예정 금액 <b>{won(plannedTotal)}</b> 원
          </span>
          <span>
            수금 금액 <b>{won(collectedTotal)}</b> 원
          </span>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-32'>코드</TableHead>
                <TableHead>거래처</TableHead>
                <TableHead className='w-28'>예정일</TableHead>
                <TableHead className='w-28'>수금일</TableHead>
                <TableHead className='w-32 text-end'>금액</TableHead>
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
                (rows ?? []).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className='font-medium'>{c.code}</TableCell>
                    <TableCell>{c.customerName}</TableCell>
                    <TableCell>{c.plannedDate ?? '-'}</TableCell>
                    <TableCell>{c.collectDate ?? '-'}</TableCell>
                    <TableCell className='text-end'>{won(c.amount)}</TableCell>
                    <TableCell>
                      <Badge variant='outline'>
                        {COLLECTION_METHOD[c.method]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline'>
                        {COLLECTION_STATUS[c.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-end'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => openEdit(c)}
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => onDelete(c)}
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
            <SheetTitle>{editId ? '수금 수정' : '수금 추가'}</SheetTitle>
          </SheetHeader>
          <div className='flex-1 space-y-4 overflow-y-auto px-4'>
            <Field label='거래처'>
              <SelectDropdown
                defaultValue={form.customerId ? String(form.customerId) : ''}
                onValueChange={(v) => set('customerId', v ? Number(v) : 0)}
                placeholder='거래처 선택'
                items={custItems}
              />
            </Field>
            <Field label='계약 (선택)'>
              <SelectDropdown
                defaultValue={form.contractId ? String(form.contractId) : ''}
                onValueChange={(v) => set('contractId', v ? Number(v) : null)}
                placeholder='연결 계약'
                items={contractItems}
              />
            </Field>
            <Field label='예정일'>
              <Input
                type='date'
                value={form.plannedDate ?? ''}
                onChange={(e) => set('plannedDate', e.target.value)}
              />
            </Field>
            <Field label='수금일 (선택)'>
              <Input
                type='date'
                value={form.collectDate ?? ''}
                onChange={(e) => set('collectDate', e.target.value)}
              />
            </Field>
            <Field label='금액'>
              <Input
                type='number'
                value={form.amount}
                onChange={(e) => set('amount', Number(e.target.value))}
              />
            </Field>
            <Field label='수금 방법'>
              <SelectDropdown
                defaultValue={form.method}
                onValueChange={(v) => set('method', v)}
                placeholder='방법 선택'
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
