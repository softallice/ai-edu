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
import { useEmployees } from '@/features/hr/api'
import {
  useProjects,
  useTimesheets,
  useSaveTimesheet,
  useDeleteTimesheet,
  ACTIVITY_TYPES,
  type Timesheet,
  type TimesheetInput,
} from './api'

const pad = (n: number) => String(n).padStart(2, '0')
const ymd = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
function monthRange() {
  const now = new Date()
  return {
    first: ymd(new Date(now.getFullYear(), now.getMonth(), 1)),
    last: ymd(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  }
}

const EMPTY: TimesheetInput = {
  employeeId: 0,
  projectId: 0,
  workDate: '',
  hours: 8,
  activityType: 'DEVELOPMENT',
  description: '',
  billable: false,
}

export function ActivityRegisterPage() {
  const { data: employees } = useEmployees()
  const { data: projects } = useProjects()
  const [employeeId, setEmployeeId] = useState<number | undefined>(undefined)
  const range = monthRange()
  const activeEmployeeId = employeeId ?? employees?.[0]?.id
  const { data: rows, isLoading } = useTimesheets({
    employeeId: activeEmployeeId,
    dateFrom: range.first,
    dateTo: range.last,
  })
  const save = useSaveTimesheet()
  const remove = useDeleteTimesheet()

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | undefined>(undefined)
  const [form, setForm] = useState<TimesheetInput>(EMPTY)

  const empItems = (employees ?? []).map((e) => ({
    label: `${e.name} (${e.employeeNo})`,
    value: String(e.id),
  }))
  const projItems = (projects ?? []).map((p) => ({
    label: p.name,
    value: String(p.id),
  }))
  const set = (k: keyof TimesheetInput, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }))
  const totalHours = (rows ?? []).reduce((s, r) => s + r.hours, 0)

  const openCreate = () => {
    setEditId(undefined)
    setForm({
      ...EMPTY,
      employeeId: activeEmployeeId ?? 0,
      projectId: projects?.[0]?.id ?? 0,
      workDate: ymd(new Date()),
    })
    setOpen(true)
  }
  const openEdit = (t: Timesheet) => {
    setEditId(t.id)
    setForm({
      employeeId: t.employeeId,
      projectId: t.projectId,
      workDate: t.workDate,
      hours: t.hours,
      activityType: t.activityType,
      description: t.description ?? '',
      billable: t.billable,
    })
    setOpen(true)
  }
  const submit = () => {
    if (!form.employeeId || !form.projectId) {
      toast.error('직원과 프로젝트는 필수입니다.')
      return
    }
    if (!form.workDate || !(form.hours > 0)) {
      toast.error('일자와 시간(0 초과)을 입력하세요.')
      return
    }
    save.mutate(
      { id: editId, body: form },
      {
        onSuccess: () => {
          toast.success(
            editId ? '활동시간을 수정했습니다.' : '활동시간을 등록했습니다.'
          )
          setOpen(false)
        },
        onError: () => toast.error('저장에 실패했습니다.'),
      }
    )
  }
  const onDelete = (t: Timesheet) => {
    if (!confirm(`${t.workDate} ${t.projectName} 활동시간을 삭제하시겠습니까?`))
      return
    remove.mutate(t.id, {
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
            <h2 className='text-2xl font-bold tracking-tight'>활동시간 등록</h2>
            <p className='text-muted-foreground'>
              이번 달 공수 입력 — 01.프로젝트관리 / 활동관리 (koerp timesheet
              이관)
            </p>
          </div>
          <div className='flex items-end gap-2'>
            <div className='space-y-1'>
              <label className='text-xs text-muted-foreground'>직원</label>
              <SelectDropdown
                defaultValue={activeEmployeeId ? String(activeEmployeeId) : ''}
                onValueChange={(v) => setEmployeeId(v ? Number(v) : undefined)}
                placeholder='직원 선택'
                items={empItems}
                className='w-52'
              />
            </div>
            <Button onClick={openCreate}>
              <Plus size={16} /> 활동시간 등록
            </Button>
          </div>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-28'>일자</TableHead>
                <TableHead>프로젝트</TableHead>
                <TableHead className='w-20'>활동</TableHead>
                <TableHead className='w-20 text-end'>시간</TableHead>
                <TableHead className='w-16 text-center'>청구</TableHead>
                <TableHead className='w-16 text-center'>승인</TableHead>
                <TableHead>내용</TableHead>
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
                    이번 달 등록된 활동시간이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                (rows ?? []).map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className='font-medium'>{t.workDate}</TableCell>
                    <TableCell>{t.projectName}</TableCell>
                    <TableCell>
                      {ACTIVITY_TYPES[t.activityType] ?? t.activityType}
                    </TableCell>
                    <TableCell className='text-end'>
                      {t.hours.toFixed(1)}
                    </TableCell>
                    <TableCell className='text-center'>
                      {t.billable ? '○' : '-'}
                    </TableCell>
                    <TableCell className='text-center'>
                      <Badge variant={t.validated ? 'default' : 'outline'}>
                        {t.validated ? '승인' : '대기'}
                      </Badge>
                    </TableCell>
                    <TableCell className='max-w-xs truncate'>
                      {t.description ?? '-'}
                    </TableCell>
                    <TableCell className='text-end'>
                      <Button
                        variant='ghost'
                        size='icon'
                        disabled={t.validated}
                        onClick={() => openEdit(t)}
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        disabled={t.validated}
                        onClick={() => onDelete(t)}
                      >
                        <Trash2 size={15} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {(rows ?? []).length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3}>이번 달 합계</TableCell>
                  <TableCell className='text-end font-semibold'>
                    {totalHours.toFixed(1)}
                  </TableCell>
                  <TableCell colSpan={4} />
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      </Main>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className='flex flex-col'>
          <SheetHeader>
            <SheetTitle>
              {editId ? '활동시간 수정' : '활동시간 등록'}
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
            <Field label='프로젝트'>
              <SelectDropdown
                defaultValue={form.projectId ? String(form.projectId) : ''}
                onValueChange={(v) => set('projectId', v ? Number(v) : 0)}
                placeholder='프로젝트 선택'
                items={projItems}
              />
            </Field>
            <Field label='일자'>
              <Input
                type='date'
                value={form.workDate}
                onChange={(e) => set('workDate', e.target.value)}
              />
            </Field>
            <Field label='시간(h)'>
              <Input
                type='number'
                min={0}
                max={24}
                step={0.5}
                value={form.hours}
                onChange={(e) => set('hours', Number(e.target.value))}
              />
            </Field>
            <Field label='활동유형'>
              <SelectDropdown
                defaultValue={form.activityType}
                onValueChange={(v) => set('activityType', v)}
                placeholder='활동유형'
                items={Object.entries(ACTIVITY_TYPES).map(([value, label]) => ({
                  label,
                  value,
                }))}
              />
            </Field>
            <Field label='내용'>
              <Input
                value={form.description ?? ''}
                onChange={(e) => set('description', e.target.value)}
                placeholder='작업 내용'
              />
            </Field>
            <label className='flex items-center gap-2 text-sm'>
              <input
                type='checkbox'
                checked={form.billable ?? false}
                onChange={(e) => set('billable', e.target.checked)}
              />
              청구 가능 공수
            </label>
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
