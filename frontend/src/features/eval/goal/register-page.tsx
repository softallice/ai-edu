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
  useEvalGoals,
  useSaveEvalGoal,
  useDeleteEvalGoal,
  useEmployeeList,
  EVAL_GOAL_STATUS,
  type EvalGoal,
  type EvalGoalInput,
  type EvalGoalStatus,
} from './api'

const EMPTY: EvalGoalInput = {
  employeeId: 0,
  period: '',
  title: '',
  weight: null,
  targetValue: '',
  selfScore: null,
  status: 'DRAFT',
  note: '',
}

const STATUS_ITEMS = (
  Object.entries(EVAL_GOAL_STATUS) as [EvalGoalStatus, string][]
).map(([value, label]) => ({ label, value }))

export function EvalGoalRegisterPage() {
  const [keyword, setKeyword] = useState('')
  const { data: rows, isLoading } = useEvalGoals({
    keyword: keyword || undefined,
  })
  const { data: employees } = useEmployeeList()
  const save = useSaveEvalGoal()
  const remove = useDeleteEvalGoal()

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | undefined>(undefined)
  const [form, setForm] = useState<EvalGoalInput>(EMPTY)

  const empItems = (employees ?? []).map((e) => ({
    label: `${e.name} (${e.employeeNo})`,
    value: String(e.id),
  }))

  const set = (k: keyof EvalGoalInput, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }))

  const openCreate = () => {
    setEditId(undefined)
    setForm({ ...EMPTY, employeeId: employees?.[0]?.id ?? 0 })
    setOpen(true)
  }

  const openEdit = (g: EvalGoal) => {
    setEditId(g.id)
    setForm({
      employeeId: g.employeeId,
      period: g.period,
      title: g.title,
      weight: g.weight,
      targetValue: g.targetValue ?? '',
      selfScore: g.selfScore,
      status: g.status,
      note: g.note ?? '',
    })
    setOpen(true)
  }

  const submit = () => {
    if (!form.employeeId || !form.period.trim() || !form.title.trim()) {
      toast.error('직원, 평가기간, 업적목표명은 필수입니다.')
      return
    }
    save.mutate(
      { id: editId, body: form },
      {
        onSuccess: () => {
          toast.success(
            editId ? '업적목표를 수정했습니다.' : '업적목표를 등록했습니다.'
          )
          setOpen(false)
        },
        onError: () => toast.error('저장에 실패했습니다.'),
      }
    )
  }

  const onDelete = (g: EvalGoal) => {
    if (!confirm(`업적목표 [${g.code}]을(를) 삭제하시겠습니까?`)) return
    remove.mutate(g.id, {
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
            <h2 className='text-2xl font-bold tracking-tight'>업적목표등록</h2>
            <p className='text-muted-foreground'>06.평가 / 업적목표등록</p>
          </div>
          <div className='flex items-end gap-2'>
            <Input
              placeholder='코드·목표명 검색'
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className='w-48'
            />
            <Button onClick={openCreate}>
              <Plus size={16} /> 목표 추가
            </Button>
          </div>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-36'>목표코드</TableHead>
                <TableHead className='w-32'>직원</TableHead>
                <TableHead className='w-28'>평가기간</TableHead>
                <TableHead>업적목표명</TableHead>
                <TableHead className='w-20 text-end'>가중치(%)</TableHead>
                <TableHead className='w-24'>상태</TableHead>
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
                (rows ?? []).map((g) => (
                  <TableRow key={g.id}>
                    <TableCell className='font-medium'>{g.code}</TableCell>
                    <TableCell>{g.employeeName}</TableCell>
                    <TableCell>{g.period}</TableCell>
                    <TableCell>{g.title}</TableCell>
                    <TableCell className='text-end'>
                      {g.weight ?? '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline'>
                        {EVAL_GOAL_STATUS[g.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-end'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => openEdit(g)}
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => onDelete(g)}
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
              {editId ? '업적목표 수정' : '업적목표 등록'}
            </SheetTitle>
          </SheetHeader>
          <div className='flex-1 space-y-4 overflow-y-auto px-4'>
            <Field label='직원'>
              <SelectDropdown
                defaultValue={form.employeeId ? String(form.employeeId) : ''}
                onValueChange={(v) => set('employeeId', v ? Number(v) : 0)}
                placeholder='직원 선택'
                items={empItems}
              />
            </Field>
            <Field label='평가기간 (예: 2025-상반기)'>
              <Input
                value={form.period}
                onChange={(e) => set('period', e.target.value)}
                placeholder='2025-상반기'
              />
            </Field>
            <Field label='업적목표명'>
              <Input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder='업적목표를 입력하세요'
              />
            </Field>
            <Field label='가중치 (%)'>
              <Input
                type='number'
                min={0}
                max={100}
                value={form.weight ?? ''}
                onChange={(e) =>
                  set('weight', e.target.value ? Number(e.target.value) : null)
                }
                placeholder='0~100'
              />
            </Field>
            <Field label='목표수준'>
              <Input
                value={form.targetValue ?? ''}
                onChange={(e) => set('targetValue', e.target.value)}
                placeholder='목표 달성 기준을 입력하세요'
              />
            </Field>
            <Field label='본인평가점수'>
              <Input
                type='number'
                value={form.selfScore ?? ''}
                onChange={(e) =>
                  set(
                    'selfScore',
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                placeholder='점수 입력 (선택)'
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
