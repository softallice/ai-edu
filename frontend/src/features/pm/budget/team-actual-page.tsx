import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
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
  useBudgets,
  useSaveBudget,
  useDeleteBudget,
  useDepartments,
  won,
  type Budget,
  type BudgetInput,
} from './api'

const EMPTY: BudgetInput = {
  budgetType: 'TEAM',
  departmentId: null,
  fiscalYear: new Date().getFullYear(),
  category: '',
  plannedAmount: 0,
  actualAmount: 0,
  note: '',
}

export function TeamBudgetActualPage() {
  const [fiscalYear, setFiscalYear] = useState(String(new Date().getFullYear()))
  const [departmentId, setDepartmentId] = useState<string>('')

  const { data: rows, isLoading } = useBudgets({
    budgetType: 'TEAM',
    fiscalYear: fiscalYear ? Number(fiscalYear) : undefined,
    departmentId: departmentId ? Number(departmentId) : undefined,
  })
  const { data: departments } = useDepartments()
  const save = useSaveBudget()
  const remove = useDeleteBudget()

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | undefined>(undefined)
  const [form, setForm] = useState<BudgetInput>(EMPTY)

  const deptItems = (departments ?? []).map((d) => ({
    label: `${d.name} (${d.code})`,
    value: String(d.id),
  }))

  const set = (k: keyof BudgetInput, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }))

  const openCreate = () => {
    setEditId(undefined)
    setForm({
      ...EMPTY,
      fiscalYear: fiscalYear ? Number(fiscalYear) : new Date().getFullYear(),
    })
    setOpen(true)
  }

  const openEdit = (b: Budget) => {
    setEditId(b.id)
    setForm({
      budgetType: 'TEAM',
      departmentId: b.departmentId,
      projectId: null,
      fiscalYear: b.fiscalYear,
      category: b.category,
      plannedAmount: b.plannedAmount,
      actualAmount: b.actualAmount,
      note: b.note ?? '',
    })
    setOpen(true)
  }

  const submit = () => {
    if (!form.category || !(form.plannedAmount > 0)) {
      toast.error('예산항목과 계획금액(0 초과)은 필수입니다.')
      return
    }
    save.mutate(
      { id: editId, body: form },
      {
        onSuccess: () => {
          toast.success(
            editId ? '예산을 수정했습니다.' : '예산을 등록했습니다.'
          )
          setOpen(false)
        },
        onError: () => toast.error('저장에 실패했습니다.'),
      }
    )
  }

  const onDelete = (b: Budget) => {
    if (!confirm(`예산 [${b.code}]을(를) 삭제하시겠습니까?`)) return
    remove.mutate(b.id, {
      onSuccess: () => toast.success('삭제했습니다.'),
      onError: () => toast.error('삭제에 실패했습니다.'),
    })
  }

  const list = rows ?? []
  const totalPlanned = list.reduce((s, r) => s + r.plannedAmount, 0)
  const totalActual = list.reduce((s, r) => s + r.actualAmount, 0)
  const totalDiff = totalPlanned - totalActual

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
            <h2 className='text-2xl font-bold tracking-tight'>팀 예산대실적</h2>
            <p className='text-muted-foreground'>
              01.프로젝트관리 / 예산관리 — 팀
            </p>
          </div>
          <div className='flex items-end gap-2'>
            <Input
              placeholder='회계연도'
              value={fiscalYear}
              onChange={(e) => setFiscalYear(e.target.value)}
              className='w-24'
              type='number'
            />
            <SelectDropdown
              defaultValue={departmentId}
              onValueChange={(v) => setDepartmentId(v)}
              placeholder='부서 전체'
              items={deptItems}
              className='w-44'
            />
            <Button onClick={openCreate}>
              <Plus size={16} /> 예산 추가
            </Button>
          </div>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-36'>예산코드</TableHead>
                <TableHead>예산항목</TableHead>
                <TableHead>부서</TableHead>
                <TableHead className='w-32 text-end'>계획</TableHead>
                <TableHead className='w-32 text-end'>실적</TableHead>
                <TableHead className='w-32 text-end'>차이</TableHead>
                <TableHead className='w-24 text-end'>달성률</TableHead>
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
              ) : list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className='h-24 text-center'>
                    결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                list.map((b) => {
                  const diff = b.plannedAmount - b.actualAmount
                  const rate =
                    b.plannedAmount > 0
                      ? ((b.actualAmount / b.plannedAmount) * 100).toFixed(1)
                      : '0.0'
                  return (
                    <TableRow key={b.id}>
                      <TableCell className='font-medium'>{b.code}</TableCell>
                      <TableCell>{b.category}</TableCell>
                      <TableCell>{b.departmentName ?? '-'}</TableCell>
                      <TableCell className='text-end'>
                        {won(b.plannedAmount)}
                      </TableCell>
                      <TableCell className='text-end'>
                        {won(b.actualAmount)}
                      </TableCell>
                      <TableCell className='text-end'>{won(diff)}</TableCell>
                      <TableCell className='text-end'>{rate}%</TableCell>
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
                  )
                })
              )}
            </TableBody>
            {list.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className='font-semibold'>
                    합계
                  </TableCell>
                  <TableCell className='text-end font-semibold'>
                    {won(totalPlanned)}
                  </TableCell>
                  <TableCell className='text-end font-semibold'>
                    {won(totalActual)}
                  </TableCell>
                  <TableCell className='text-end font-semibold'>
                    {won(totalDiff)}
                  </TableCell>
                  <TableCell className='text-end font-semibold'>
                    {totalPlanned > 0
                      ? ((totalActual / totalPlanned) * 100).toFixed(1)
                      : '0.0'}
                    %
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      </Main>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className='flex flex-col'>
          <SheetHeader>
            <SheetTitle>{editId ? '팀 예산 수정' : '팀 예산 추가'}</SheetTitle>
          </SheetHeader>
          <div className='flex-1 space-y-4 overflow-y-auto px-4'>
            <Field label='부서'>
              <SelectDropdown
                defaultValue={
                  form.departmentId ? String(form.departmentId) : ''
                }
                onValueChange={(v) => set('departmentId', v ? Number(v) : null)}
                placeholder='부서 선택'
                items={deptItems}
              />
            </Field>
            <Field label='회계연도'>
              <Input
                type='number'
                value={form.fiscalYear}
                onChange={(e) => set('fiscalYear', Number(e.target.value))}
              />
            </Field>
            <Field label='예산항목'>
              <Input
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                placeholder='인건비 / 경비 / 외주비'
              />
            </Field>
            <Field label='계획금액'>
              <Input
                type='number'
                value={form.plannedAmount}
                onChange={(e) => set('plannedAmount', Number(e.target.value))}
              />
            </Field>
            <Field label='실적금액'>
              <Input
                type='number'
                value={form.actualAmount ?? 0}
                onChange={(e) => set('actualAmount', Number(e.target.value))}
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
