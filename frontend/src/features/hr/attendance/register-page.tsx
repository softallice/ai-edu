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
  useAttendances,
  useSaveAttendance,
  useDeleteAttendance,
  useEmployeeList,
  ATTENDANCE_STATUS,
  type Attendance,
  type AttendanceInput,
  type AttendanceStatus,
} from './api'

const EMPTY: AttendanceInput = {
  employeeId: 0,
  workDate: '',
  checkIn: '',
  checkOut: '',
  workHours: 0,
  status: 'NORMAL',
  note: '',
}

const STATUS_ITEMS = (
  Object.entries(ATTENDANCE_STATUS) as [AttendanceStatus, string][]
).map(([value, label]) => ({ label, value }))

export function AttendanceRegisterPage() {
  const [filterEmpId, setFilterEmpId] = useState<number | undefined>(undefined)

  const { data: rows, isLoading } = useAttendances({
    employeeId: filterEmpId,
  })
  const { data: employees } = useEmployeeList()
  const save = useSaveAttendance()
  const remove = useDeleteAttendance()

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | undefined>(undefined)
  const [form, setForm] = useState<AttendanceInput>(EMPTY)

  const empItems = (employees ?? []).map((e) => ({
    label: `${e.name} (${e.employeeNo})`,
    value: String(e.id),
  }))

  const set = (k: keyof AttendanceInput, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }))

  const openCreate = () => {
    setEditId(undefined)
    setForm({
      ...EMPTY,
      employeeId: employees?.[0]?.id ?? 0,
    })
    setOpen(true)
  }

  const openEdit = (a: Attendance) => {
    setEditId(a.id)
    setForm({
      employeeId: a.employeeId,
      workDate: a.workDate,
      checkIn: a.checkIn ?? '',
      checkOut: a.checkOut ?? '',
      workHours: a.workHours,
      status: a.status,
      note: a.note ?? '',
    })
    setOpen(true)
  }

  const submit = () => {
    if (!form.employeeId || !form.workDate) {
      toast.error('직원과 근무일은 필수입니다.')
      return
    }
    const body: AttendanceInput = {
      ...form,
      checkIn: form.checkIn || null,
      checkOut: form.checkOut || null,
      note: form.note || null,
    }
    save.mutate(
      { id: editId, body },
      {
        onSuccess: () => {
          toast.success(
            editId ? '근태를 수정했습니다.' : '근태를 등록했습니다.'
          )
          setOpen(false)
        },
        onError: () => toast.error('저장에 실패했습니다.'),
      }
    )
  }

  const onDelete = (a: Attendance) => {
    if (!confirm(`근태 [${a.code}]을(를) 삭제하시겠습니까?`)) return
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
            <h2 className='text-2xl font-bold tracking-tight'>출퇴근부 등록</h2>
            <p className='text-muted-foreground'>
              05.인사 / 근태관리 — 출퇴근부 등록·수정
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
              <Plus size={16} /> 근태 등록
            </Button>
          </div>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-36'>코드</TableHead>
                <TableHead>직원</TableHead>
                <TableHead className='w-28'>근무일</TableHead>
                <TableHead className='w-24'>출근</TableHead>
                <TableHead className='w-24'>퇴근</TableHead>
                <TableHead className='w-24 text-end'>근무시간</TableHead>
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
                (rows ?? []).map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className='font-medium'>{a.code}</TableCell>
                    <TableCell>
                      {a.employeeName}
                      <span className='ml-1 text-xs text-muted-foreground'>
                        ({a.employeeNo})
                      </span>
                    </TableCell>
                    <TableCell>{a.workDate}</TableCell>
                    <TableCell>{a.checkIn ?? '-'}</TableCell>
                    <TableCell>{a.checkOut ?? '-'}</TableCell>
                    <TableCell className='text-end'>
                      {Number(a.workHours).toFixed(1)}h
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline'>
                        {ATTENDANCE_STATUS[a.status]}
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
            <SheetTitle>{editId ? '근태 수정' : '근태 등록'}</SheetTitle>
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
            <Field label='근무일'>
              <Input
                type='date'
                value={form.workDate}
                onChange={(e) => set('workDate', e.target.value)}
              />
            </Field>
            <Field label='출근 시각'>
              <Input
                type='time'
                value={form.checkIn ?? ''}
                onChange={(e) => set('checkIn', e.target.value)}
              />
            </Field>
            <Field label='퇴근 시각'>
              <Input
                type='time'
                value={form.checkOut ?? ''}
                onChange={(e) => set('checkOut', e.target.value)}
              />
            </Field>
            <p className='text-xs text-muted-foreground'>
              출근·퇴근을 모두 입력하면 근무시간이 자동 계산됩니다.
            </p>
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
