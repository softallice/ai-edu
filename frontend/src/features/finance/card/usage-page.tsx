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
  useCardTransactions,
  useSaveCardTransaction,
  useDeleteCardTransaction,
  useEmployees,
  CARD_TX_STATUS,
  won,
  type CardTransaction,
  type CardTransactionInput,
  type CardTransactionStatus,
} from './api'

const pad = (n: number) => String(n).padStart(2, '0')
const ymd = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

const EMPTY: CardTransactionInput = {
  cardNo: '',
  usedDate: ymd(new Date()),
  merchant: '',
  approvalAmount: 0,
  purchaseAmount: 0,
  billingMonth: '',
  status: 'APPROVED',
  employeeId: null,
  description: '',
}

const STATUS_ITEMS = (
  Object.entries(CARD_TX_STATUS) as [CardTransactionStatus, string][]
).map(([value, label]) => ({ label, value }))

export function CardUsagePage() {
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<CardTransactionStatus | undefined>(
    undefined
  )

  const { data: rows, isLoading } = useCardTransactions({
    keyword: keyword || undefined,
    status,
  })
  const { data: employees } = useEmployees()
  const save = useSaveCardTransaction()
  const remove = useDeleteCardTransaction()

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | undefined>(undefined)
  const [form, setForm] = useState<CardTransactionInput>(EMPTY)

  const employeeItems = (employees ?? []).map((e) => ({
    label: e.name,
    value: String(e.id),
  }))

  const set = (k: keyof CardTransactionInput, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }))

  const openCreate = () => {
    setEditId(undefined)
    setForm({ ...EMPTY, usedDate: ymd(new Date()) })
    setOpen(true)
  }

  const openEdit = (c: CardTransaction) => {
    setEditId(c.id)
    setForm({
      cardNo: c.cardNo,
      usedDate: c.usedDate,
      merchant: c.merchant ?? '',
      approvalAmount: c.approvalAmount,
      purchaseAmount: c.purchaseAmount,
      billingMonth: c.billingMonth ?? '',
      status: c.status,
      employeeId: c.employeeId,
      description: c.description ?? '',
    })
    setOpen(true)
  }

  const submit = () => {
    if (!form.cardNo.trim()) {
      toast.error('카드번호는 필수입니다.')
      return
    }
    if (!form.usedDate) {
      toast.error('사용일은 필수입니다.')
      return
    }
    save.mutate(
      {
        id: editId,
        body: {
          ...form,
          billingMonth: form.billingMonth || null,
          employeeId: form.employeeId || null,
        },
      },
      {
        onSuccess: () => {
          toast.success(editId ? '수정했습니다.' : '등록했습니다.')
          setOpen(false)
        },
        onError: () => toast.error('저장에 실패했습니다.'),
      }
    )
  }

  const onDelete = (c: CardTransaction) => {
    if (!confirm(`거래내역 [${c.code}]을(를) 삭제하시겠습니까?`)) return
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
            <h2 className='text-2xl font-bold tracking-tight'>
              법인카드(승인/매입)내역
            </h2>
            <p className='text-muted-foreground'>
              04.재무 / 법인카드 — 승인·매입
            </p>
          </div>
          <div className='flex flex-wrap items-end gap-2'>
            <Input
              placeholder='코드·카드번호·가맹점 검색'
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className='w-48'
            />
            <SelectDropdown
              defaultValue='ALL'
              onValueChange={(v) =>
                setStatus(
                  v === 'ALL' ? undefined : (v as CardTransactionStatus)
                )
              }
              placeholder='상태'
              items={[{ label: '전체', value: 'ALL' }, ...STATUS_ITEMS]}
              className='w-28'
            />
            <Button onClick={openCreate}>
              <Plus size={16} /> 거래 등록
            </Button>
          </div>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-32'>카드번호</TableHead>
                <TableHead className='w-24'>사용자</TableHead>
                <TableHead className='w-28'>사용일</TableHead>
                <TableHead>가맹점</TableHead>
                <TableHead className='w-32 text-end'>승인금액</TableHead>
                <TableHead className='w-32 text-end'>매입금액</TableHead>
                <TableHead className='w-24'>상태</TableHead>
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
                    <TableCell className='font-medium'>{c.cardNo}</TableCell>
                    <TableCell>{c.employeeName ?? '-'}</TableCell>
                    <TableCell>{c.usedDate}</TableCell>
                    <TableCell>{c.merchant ?? '-'}</TableCell>
                    <TableCell className='text-end'>
                      {won(c.approvalAmount)}
                    </TableCell>
                    <TableCell className='text-end'>
                      {won(c.purchaseAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline'>
                        {CARD_TX_STATUS[c.status]}
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
            <SheetTitle>
              {editId ? '법인카드 거래 수정' : '법인카드 거래 등록'}
            </SheetTitle>
          </SheetHeader>
          <div className='flex-1 space-y-4 overflow-y-auto px-4'>
            <Field label='카드번호'>
              <Input
                value={form.cardNo}
                onChange={(e) => set('cardNo', e.target.value)}
                placeholder='예: 1234-****-****-5678'
              />
            </Field>
            <Field label='사용일'>
              <Input
                type='date'
                value={form.usedDate}
                onChange={(e) => set('usedDate', e.target.value)}
              />
            </Field>
            <Field label='가맹점'>
              <Input
                value={form.merchant ?? ''}
                onChange={(e) => set('merchant', e.target.value)}
                placeholder='예: 스타벅스 강남점'
              />
            </Field>
            <Field label='사용자 (선택)'>
              <SelectDropdown
                defaultValue={form.employeeId ? String(form.employeeId) : ''}
                onValueChange={(v) => set('employeeId', v ? Number(v) : null)}
                placeholder='직원 선택(선택)'
                items={employeeItems}
              />
            </Field>
            <Field label='승인금액'>
              <Input
                type='number'
                value={form.approvalAmount ?? 0}
                onChange={(e) => set('approvalAmount', Number(e.target.value))}
              />
            </Field>
            <Field label='매입금액'>
              <Input
                type='number'
                value={form.purchaseAmount ?? 0}
                onChange={(e) => set('purchaseAmount', Number(e.target.value))}
              />
            </Field>
            <Field label='청구월 (YYYY-MM, 선택)'>
              <Input
                value={form.billingMonth ?? ''}
                onChange={(e) => set('billingMonth', e.target.value)}
                placeholder='예: 2025-03'
                maxLength={7}
              />
            </Field>
            <Field label='상태'>
              <SelectDropdown
                defaultValue={form.status}
                onValueChange={(v) => set('status', v as CardTransactionStatus)}
                placeholder='상태'
                items={STATUS_ITEMS}
              />
            </Field>
            <Field label='적요'>
              <Input
                value={form.description ?? ''}
                onChange={(e) => set('description', e.target.value)}
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
