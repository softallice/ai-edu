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
  useAppraisals,
  useSaveAppraisal,
  useDeleteAppraisal,
  useEmployees,
  APPRAISAL_STATUS,
  type Appraisal,
  type AppraisalInput,
  type AppraisalStatus,
} from './api'

const GRADE_ITEMS = ['S', 'A', 'B', 'C', 'D'].map((g) => ({ label: g, value: g }))

const EMPTY: AppraisalInput = {
  employeeId: 0,
  evalGoalId: null,
  period: '',
  selfScore: null,
  firstScore: null,
  secondScore: null,
  grade: null,
  status: 'FIRST',
  comment: '',
}

const STATUS_ITEMS = (
  Object.entries(APPRAISAL_STATUS) as [AppraisalStatus, string][]
).map(([value, label]) => ({ label, value }))

export function ReviewAppraisalPage() {
  const [keyword, setKeyword] = useState('')
  const { data: rows, isLoading } = useAppraisals({ keyword: keyword || undefined })
  const { data: employees } = useEmployees()
  const save = useSaveAppraisal()
  const remove = useDeleteAppraisal()

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | undefined>(undefined)
  const [form, setForm] = useState<AppraisalInput>(EMPTY)

  const empItems = (employees ?? []).map((e) => ({
    label: `${e.name} (${e.employeeNo})`,
    value: String(e.id),
  }))

  const set = (k: keyof AppraisalInput, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }))

  const openCreate = () => {
    setEditId(undefined)
    setForm({ ...EMPTY, employeeId: employees?.[0]?.id ?? 0 })
    setOpen(true)
  }

  const openEdit = (a: Appraisal) => {
    setEditId(a.id)
    setForm({
      employeeId: a.employeeId,
      evalGoalId: a.evalGoalId,
      period: a.period,
      selfScore: a.selfScore,
      firstScore: a.firstScore,
      secondScore: a.secondScore,
      grade: a.grade,
      status: a.status,
      comment: a.comment ?? '',
    })
    setOpen(true)
  }

  const submit = () => {
    if (!form.employeeId || !form.period.trim()) {
      toast.error('피평가자와 평가기간은 필수입니다.')
      return
    }
    save.mutate(
      { id: editId, body: form },
      {
        onSuccess: () => {
          toast.success(editId ? '수정했습니다.' : '등록했습니다.')
          setOpen(false)
        },
        onError: () => toast.error('저장에 실패했습니다.'),
      }
    )
  }

  const onDelete = (a: Appraisal) => {
    if (!confirm(`평가 [${a.code}]을(를) 삭제하시겠습니까?`)) return
    remove.mutate(a.id, {
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
            <h2 className='text-2xl font-bold tracking-tight'>업적평가(1차/2차)</h2>
            <p className='text-muted-foreground'>
              06.평가 / 업적평가 — 1차/2차 평가
            </p>
          </div>
          <div className='flex items-end gap-2'>
            <Input
              placeholder='코드 검색'
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className='w-48'
            />
            <Button onClick={openCreate}>
              <Plus size={16} /> 평가 추가
            </Button>
          </div>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-36'>평가코드</TableHead>
                <TableHead className='w-28'>피평가자</TableHead>
                <TableHead className='w-24'>평가기간</TableHead>
                <TableHead className='w-20 text-end'>본인</TableHead>
                <TableHead className='w-20 text-end'>1차</TableHead>
                <TableHead className='w-20 text-end'>2차</TableHead>
                <TableHead className='w-16'>등급</TableHead>
                <TableHead className='w-24'>상태</TableHead>
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
                (rows ?? []).map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className='font-medium'>{a.code}</TableCell>
                    <TableCell>{a.employeeName}</TableCell>
                    <TableCell>{a.period}</TableCell>
                    <TableCell className='text-end'>{a.selfScore ?? '-'}</TableCell>
                    <TableCell className='text-end'>{a.firstScore ?? '-'}</TableCell>
                    <TableCell className='text-end'>{a.secondScore ?? '-'}</TableCell>
                    <TableCell>{a.grade ?? '-'}</TableCell>
                    <TableCell>
                      <Badge variant='outline'>
                        {APPRAISAL_STATUS[a.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-end'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => openEdit(a)}
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => onDelete(a)}
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
              {editId ? '업적평가 수정' : '업적평가 등록'}
            </SheetTitle>
          </SheetHeader>
          <div className='flex-1 space-y-4 overflow-y-auto px-4'>
            <Field label='피평가자'>
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
            <Field label='1차평가점수'>
              <Input
                type='number'
                value={form.firstScore ?? ''}
                onChange={(e) =>
                  set('firstScore', e.target.value ? Number(e.target.value) : null)
                }
                placeholder='1차 점수 (선택)'
              />
            </Field>
            <Field label='2차평가점수'>
              <Input
                type='number'
                value={form.secondScore ?? ''}
                onChange={(e) =>
                  set('secondScore', e.target.value ? Number(e.target.value) : null)
                }
                placeholder='2차 점수 (선택)'
              />
            </Field>
            <Field label='등급'>
              <SelectDropdown
                defaultValue={form.grade ?? ''}
                onValueChange={(v) => set('grade', v || null)}
                placeholder='등급 선택 (선택)'
                items={GRADE_ITEMS}
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
            <Field label='평가의견'>
              <Input
                value={form.comment ?? ''}
                onChange={(e) => set('comment', e.target.value)}
                placeholder='평가의견을 입력하세요'
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
