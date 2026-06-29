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
  usePayslips,
  useSavePayslip,
  useDeletePayslip,
  useEmployees,
  PAYSLIP_STATUS,
  won,
  type Payslip,
  type PayslipInput,
  type PayslipStatus,
} from './api'

const EMPTY: PayslipInput = {
  employeeId: 0,
  payMonth: '',
  baseSalary: null,
  allowance: null,
  bonus: null,
  deduction: null,
  status: 'DRAFT',
  note: '',
}

const STATUS_ITEMS = (
  Object.entries(PAYSLIP_STATUS) as [PayslipStatus, string][]
).map(([value, label]) => ({ label, value }))

export function PayslipPage() {
  const [filterEmpId, setFilterEmpId] = useState<number | undefined>(undefined)

  const { data: rows, isLoading } = usePayslips({ employeeId: filterEmpId })
  const { data: employees } = useEmployees()
  const save = useSavePayslip()
  const del = useDeletePayslip()

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | undefined>(undefined)
  const [form, setForm] = useState<PayslipInput>(EMPTY)

  const empItems = (employees ?? []).map((e) => ({
    label: `${e.name} (${e.employeeNo})`,
    value: String(e.id),
  }))

  const set = (k: keyof PayslipInput, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }))

  const openCreate = () => {
    setEditId(undefined)
    setForm({ ...EMPTY, employeeId: employees?.[0]?.id ?? 0 })
    setOpen(true)
  }

  const openEdit = (p: Payslip) => {
    setEditId(p.id)
    setForm({
      employeeId: p.employeeId,
      payMonth: p.payMonth,
      baseSalary: p.baseSalary,
      allowance: p.allowance,
      bonus: p.bonus,
      deduction: p.deduction,
      status: p.status,
      note: p.note ?? '',
    })
    setOpen(true)
  }

  const onDelete = (p: Payslip) => {
    if (!confirm(`[${p.code}] 급여명세를 삭제하시겠습니까?`)) return
    del.mutate(p.id, {
      onSuccess: () => toast.success('삭제했습니다.'),
      onError: () => toast.error('삭제에 실패했습니다.'),
    })
  }

  const netPreview =
    (form.baseSalary ?? 0) +
    (form.allowance ?? 0) +
    (form.bonus ?? 0) -
    (form.deduction ?? 0)

  const submit = () => {
    if (!form.employeeId || !form.payMonth) {
      toast.error('직원과 귀속월은 필수입니다.')
      return
    }
    const body: PayslipInput = {
      ...form,
      note: form.note || null,
    }
    save.mutate(
      { id: editId, body },
      {
        onSuccess: () => {
          toast.success(editId ? '수정했습니다.' : '등록했습니다.')
          setOpen(false)
        },
        onError: () => toast.error('저장에 실패했습니다.'),
      }
    )
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
            <h2 className='text-2xl font-bold tracking-tight'>급여명세표</h2>
            <p className='text-muted-foreground'>
              05.인사 / 급여 — 급여명세 관리
            </p>
          </div>
          <div className='flex items-end gap-2'>
            <SelectDropdown
              defaultValue='ALL'
              onValueChange={(v) =>
                setFilterEmpId(v === 'ALL' ? undefined : Number(v))
              }
              placeholder='직원 필터'
              items={[{ label: '전체', value: 'ALL' }, ...empItems]}
              className='w-44'
            />
            <Button onClick={openCreate}>
              <Plus size={16} /> 명세 등록
            </Button>
          </div>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-36'>코드</TableHead>
                <TableHead>직원</TableHead>
                <TableHead className='w-24'>귀속월</TableHead>
                <TableHead className='w-28 text-end'>기본급</TableHead>
                <TableHead className='w-24 text-end'>수당</TableHead>
                <TableHead className='w-24 text-end'>상여</TableHead>
                <TableHead className='w-24 text-end'>공제</TableHead>
                <TableHead className='w-28 text-end'>실지급액</TableHead>
                <TableHead className='w-20'>상태</TableHead>
                <TableHead className='w-24 text-end'>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className='h-24 text-center'>
                    불러오는 중…
                  </TableCell>
                </TableRow>
              ) : (rows ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className='h-24 text-center'>
                    결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                (rows ?? []).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className='font-medium'>{p.code}</TableCell>
                    <TableCell>
                      {p.employeeName}
                      {p.departmentName && (
                        <span className='ml-1 text-xs text-muted-foreground'>
                          ({p.departmentName})
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{p.payMonth}</TableCell>
                    <TableCell className='text-end'>
                      {won(p.baseSalary)}
                    </TableCell>
                    <TableCell className='text-end'>
                      {won(p.allowance)}
                    </TableCell>
                    <TableCell className='text-end'>{won(p.bonus)}</TableCell>
                    <TableCell className='text-end'>
                      {won(p.deduction)}
                    </TableCell>
                    <TableCell className='text-end font-semibold'>
                      {won(p.netPay)}
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline'>
                        {PAYSLIP_STATUS[p.status]}
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
              {editId ? '급여명세 수정' : '급여명세 등록'}
            </SheetTitle>
          </SheetHeader>
          <div className='flex-1 space-y-4 overflow-y-auto px-4'>
            <Field label='직원 *'>
              <SelectDropdown
                defaultValue={form.employeeId ? String(form.employeeId) : ''}
                onValueChange={(v) => set('employeeId', v ? Number(v) : 0)}
                placeholder='직원 선택'
                items={empItems}
              />
            </Field>
            <Field label='귀속월 * (YYYY-MM)'>
              <Input
                type='month'
                value={form.payMonth}
                onChange={(e) => set('payMonth', e.target.value)}
              />
            </Field>
            <Field label='기본급'>
              <Input
                type='number'
                min='0'
                step='1000'
                value={form.baseSalary ?? ''}
                onChange={(e) =>
                  set(
                    'baseSalary',
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                placeholder='예: 3000000'
              />
            </Field>
            <Field label='수당'>
              <Input
                type='number'
                min='0'
                step='1000'
                value={form.allowance ?? ''}
                onChange={(e) =>
                  set(
                    'allowance',
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                placeholder='예: 200000'
              />
            </Field>
            <Field label='상여/성과금'>
              <Input
                type='number'
                min='0'
                step='1000'
                value={form.bonus ?? ''}
                onChange={(e) =>
                  set('bonus', e.target.value ? Number(e.target.value) : null)
                }
                placeholder='예: 500000'
              />
            </Field>
            <Field label='공제'>
              <Input
                type='number'
                min='0'
                step='1000'
                value={form.deduction ?? ''}
                onChange={(e) =>
                  set(
                    'deduction',
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                placeholder='예: 400000'
              />
            </Field>
            <div className='rounded-md border bg-muted/40 px-4 py-2 text-sm'>
              실지급액 미리보기:{' '}
              <span className='font-semibold'>{won(netPreview)}</span> 원
            </div>
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
                maxLength={300}
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
