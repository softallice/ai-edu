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
  useLeaveRequests,
  useSaveLeaveRequest,
  useEmployees,
  LEAVE_TYPE,
  LEAVE_STATUS,
  WORK_TYPES,
  type LeaveRequest,
  type LeaveRequestInput,
  type LeaveRequestType,
  type LeaveRequestStatus,
} from './api'

const EMPTY: LeaveRequestInput = {
  employeeId: 0,
  requestType: 'OVERTIME',
  startDate: '',
  endDate: '',
  days: null,
  hours: null,
  reason: '',
  status: 'REQUESTED',
  note: '',
}

const TYPE_ITEMS = WORK_TYPES.map((v) => ({ label: LEAVE_TYPE[v], value: v }))

const STATUS_ITEMS = (
  Object.entries(LEAVE_STATUS) as [LeaveRequestStatus, string][]
).map(([value, label]) => ({ label, value }))

export function OvertimeApplyPage() {
  const [filterEmpId, setFilterEmpId] = useState<number | undefined>(undefined)

  const { data: allRows, isLoading } = useLeaveRequests({
    employeeId: filterEmpId,
  })
  const { data: employees } = useEmployees()
  const save = useSaveLeaveRequest()

  // 근로류만 필터
  const rows = (allRows ?? []).filter((r) =>
    WORK_TYPES.includes(r.requestType as LeaveRequestType)
  )

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | undefined>(undefined)
  const [form, setForm] = useState<LeaveRequestInput>(EMPTY)

  const empItems = (employees ?? []).map((e) => ({
    label: `${e.name} (${e.employeeNo})`,
    value: String(e.id),
  }))

  const set = (k: keyof LeaveRequestInput, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }))

  const openCreate = () => {
    setEditId(undefined)
    setForm({
      ...EMPTY,
      employeeId: employees?.[0]?.id ?? 0,
    })
    setOpen(true)
  }

  const openEdit = (lr: LeaveRequest) => {
    setEditId(lr.id)
    setForm({
      employeeId: lr.employeeId,
      requestType: lr.requestType,
      startDate: lr.startDate,
      endDate: lr.endDate,
      days: lr.days,
      hours: lr.hours,
      reason: lr.reason ?? '',
      status: lr.status,
      note: lr.note ?? '',
    })
    setOpen(true)
  }

  const onCancel = (lr: LeaveRequest) => {
    if (!confirm(`[${lr.code}] 신청을 취소하시겠습니까?`)) return
    const body: LeaveRequestInput = {
      employeeId: lr.employeeId,
      requestType: lr.requestType,
      startDate: lr.startDate,
      endDate: lr.endDate,
      days: lr.days,
      hours: lr.hours,
      reason: lr.reason ?? null,
      status: 'CANCELED',
      note: lr.note ?? null,
    }
    save.mutate(
      { id: lr.id, body },
      {
        onSuccess: () => toast.success('신청을 취소했습니다.'),
        onError: () => toast.error('취소에 실패했습니다.'),
      }
    )
  }

  const submit = () => {
    if (!form.employeeId || !form.startDate || !form.endDate) {
      toast.error('직원, 일자는 필수입니다.')
      return
    }
    const body: LeaveRequestInput = {
      ...form,
      reason: form.reason || null,
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
            <h2 className='text-2xl font-bold tracking-tight'>연장/휴일근로신청</h2>
            <p className='text-muted-foreground'>
              05.인사 / 근태 — 연장·휴일근로
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
              <Plus size={16} /> 신청 등록
            </Button>
          </div>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-36'>신청번호</TableHead>
                <TableHead>직원</TableHead>
                <TableHead className='w-24'>종류</TableHead>
                <TableHead className='w-28'>일자</TableHead>
                <TableHead className='w-20 text-end'>시간</TableHead>
                <TableHead className='w-20'>상태</TableHead>
                <TableHead className='w-28 text-end'>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className='h-24 text-center'>
                    불러오는 중…
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className='h-24 text-center'>
                    결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((lr) => (
                  <TableRow key={lr.id}>
                    <TableCell className='font-medium'>{lr.code}</TableCell>
                    <TableCell>
                      {lr.employeeName}
                      {lr.departmentName && (
                        <span className='ml-1 text-xs text-muted-foreground'>
                          ({lr.departmentName})
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline'>{LEAVE_TYPE[lr.requestType]}</Badge>
                    </TableCell>
                    <TableCell>{lr.startDate}</TableCell>
                    <TableCell className='text-end'>
                      {lr.hours != null ? `${lr.hours}h` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline'>{LEAVE_STATUS[lr.status]}</Badge>
                    </TableCell>
                    <TableCell className='text-end'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => openEdit(lr)}
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => onCancel(lr)}
                        disabled={lr.status === 'CANCELED'}
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
            <SheetTitle>{editId ? '근로 수정' : '근로 신청'}</SheetTitle>
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
            <Field label='근로 종류'>
              <SelectDropdown
                defaultValue={form.requestType}
                onValueChange={(v) => set('requestType', v)}
                placeholder='종류 선택'
                items={TYPE_ITEMS}
              />
            </Field>
            <Field label='일자'>
              <Input
                type='date'
                value={form.startDate}
                onChange={(e) => {
                  set('startDate', e.target.value)
                  set('endDate', e.target.value)
                }}
              />
            </Field>
            <Field label='시간'>
              <Input
                type='number'
                step='0.5'
                min='0.5'
                value={form.hours ?? ''}
                onChange={(e) =>
                  set('hours', e.target.value ? Number(e.target.value) : null)
                }
                placeholder='예: 2, 3.5'
              />
            </Field>
            <Field label='사유'>
              <Input
                value={form.reason ?? ''}
                onChange={(e) => set('reason', e.target.value)}
                maxLength={300}
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
