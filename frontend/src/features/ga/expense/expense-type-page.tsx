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
  useExpenseRequests,
  useSaveExpenseRequest,
  useDeleteExpenseRequest,
  useEmployees,
  EXPENSE_STATUS,
  won,
  type ExpenseRequest,
  type ExpenseRequestInput,
  type ExpenseType,
  type ExpenseStatus,
} from './api'

type Props = {
  fixedType: ExpenseType
  title: string
  subtitle: string
}

const EMPTY_BASE: Omit<ExpenseRequestInput, 'expenseType'> = {
  employeeId: 0,
  title: '',
  amount: 0,
  requestDate: '',
  reason: '',
  status: 'REQUESTED',
}

const STATUS_ITEMS = (
  Object.entries(EXPENSE_STATUS) as [ExpenseStatus, string][]
).map(([value, label]) => ({ label, value }))

export function ExpenseTypePage({ fixedType, title, subtitle }: Props) {
  const [keyword, setKeyword] = useState('')
  const { data: rows, isLoading } = useExpenseRequests({
    expenseType: fixedType,
    keyword: keyword || undefined,
  })
  const { data: employees } = useEmployees()
  const save = useSaveExpenseRequest()
  const remove = useDeleteExpenseRequest()

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | undefined>(undefined)
  const [form, setForm] = useState<ExpenseRequestInput>({
    ...EMPTY_BASE,
    expenseType: fixedType,
  })

  const empItems = (employees ?? []).map((e) => ({
    label: `${e.name} (${e.employeeNo})`,
    value: String(e.id),
  }))

  const set = (k: keyof ExpenseRequestInput, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }))

  const openCreate = () => {
    setEditId(undefined)
    setForm({
      ...EMPTY_BASE,
      expenseType: fixedType,
      employeeId: employees?.[0]?.id ?? 0,
    })
    setOpen(true)
  }

  const openEdit = (r: ExpenseRequest) => {
    setEditId(r.id)
    setForm({
      employeeId: r.employeeId,
      expenseType: fixedType,
      title: r.title,
      amount: r.amount,
      requestDate: r.requestDate ?? '',
      reason: r.reason ?? '',
      status: r.status,
    })
    setOpen(true)
  }

  const submit = () => {
    if (!form.employeeId || !form.title.trim() || !(form.amount > 0)) {
      toast.error('신청자, 제목, 금액(0 초과)은 필수입니다.')
      return
    }
    save.mutate(
      {
        id: editId,
        body: {
          ...form,
          expenseType: fixedType,
          requestDate: form.requestDate || null,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            editId
              ? `${title}을(를) 수정했습니다.`
              : `${title}을(를) 등록했습니다.`
          )
          setOpen(false)
        },
        onError: () => toast.error('저장에 실패했습니다.'),
      }
    )
  }

  const onDelete = (r: ExpenseRequest) => {
    if (!confirm(`${title} [${r.code}]을(를) 삭제하시겠습니까?`)) return
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
            <h2 className='text-2xl font-bold tracking-tight'>{title}</h2>
            <p className='text-muted-foreground'>{subtitle}</p>
          </div>
          <div className='flex items-end gap-2'>
            <Input
              placeholder='신청번호·제목 검색'
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className='w-48'
            />
            <Button onClick={openCreate}>
              <Plus size={16} /> {title} 등록
            </Button>
          </div>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-36'>신청번호</TableHead>
                <TableHead className='w-32'>신청자</TableHead>
                <TableHead>제목</TableHead>
                <TableHead className='w-28'>신청일</TableHead>
                <TableHead className='w-32 text-end'>금액</TableHead>
                <TableHead className='w-20'>상태</TableHead>
                <TableHead className='w-24 text-end'>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className='h-24 text-center'>
                    불러오는 중…
                  </TableCell>
                </TableRow>
              ) : (rows ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className='h-24 text-center'>
                    결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                (rows ?? []).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className='font-medium'>{r.code}</TableCell>
                    <TableCell>{r.employeeName}</TableCell>
                    <TableCell>{r.title}</TableCell>
                    <TableCell>{r.requestDate ?? '-'}</TableCell>
                    <TableCell className='text-end'>{won(r.amount)}</TableCell>
                    <TableCell>
                      <Badge variant='outline'>
                        {EXPENSE_STATUS[r.status]}
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
              {editId ? `${title} 수정` : `${title} 등록`}
            </SheetTitle>
          </SheetHeader>
          <div className='flex-1 space-y-4 overflow-y-auto px-4'>
            <Field label='신청자'>
              <SelectDropdown
                defaultValue={form.employeeId ? String(form.employeeId) : ''}
                onValueChange={(v) => set('employeeId', v ? Number(v) : 0)}
                placeholder='직원 선택'
                items={empItems}
              />
            </Field>
            <Field label='제목'>
              <Input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder='제목을 입력하세요'
              />
            </Field>
            <Field label='금액'>
              <Input
                type='number'
                value={form.amount}
                onChange={(e) => set('amount', Number(e.target.value))}
              />
            </Field>
            <Field label='신청일'>
              <Input
                type='date'
                value={form.requestDate ?? ''}
                onChange={(e) => set('requestDate', e.target.value)}
              />
            </Field>
            <Field label='사유'>
              <Input
                value={form.reason ?? ''}
                onChange={(e) => set('reason', e.target.value)}
                placeholder='사유를 입력하세요'
              />
            </Field>
            <Field label='상태'>
              <SelectDropdown
                defaultValue={form.status}
                onValueChange={(v) => set('status', v as ExpenseStatus)}
                placeholder='상태'
                items={STATUS_ITEMS}
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
