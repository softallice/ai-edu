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
  useEmployeeRecords,
  useSaveEmployeeRecord,
  useDeleteEmployeeRecord,
  useEmployees,
  RECORD_TYPE,
  WORK_TYPES,
  type EmployeeRecord,
  type EmployeeRecordInput,
  type EmployeeRecordType,
} from './api'

const EMPTY: EmployeeRecordInput = {
  employeeId: 0,
  recordType: 'WORK',
  title: '',
  organization: '',
  startDate: '',
  endDate: '',
  description: '',
  note: '',
}

export function WorkHistoryPage() {
  const [filterEmpId, setFilterEmpId] = useState<number | undefined>(undefined)

  const { data: allRows, isLoading } = useEmployeeRecords({
    employeeId: filterEmpId,
  })
  const { data: employees } = useEmployees()
  const save = useSaveEmployeeRecord()
  const remove = useDeleteEmployeeRecord()

  // 업무이력 유형만 필터
  const rows = (allRows ?? []).filter((r) =>
    WORK_TYPES.includes(r.recordType as EmployeeRecordType)
  )

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | undefined>(undefined)
  const [form, setForm] = useState<EmployeeRecordInput>(EMPTY)

  const empItems = (employees ?? []).map((e) => ({
    label: `${e.name} (${e.employeeNo})`,
    value: String(e.id),
  }))

  const set = (k: keyof EmployeeRecordInput, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }))

  const openCreate = () => {
    setEditId(undefined)
    setForm({ ...EMPTY, employeeId: employees?.[0]?.id ?? 0 })
    setOpen(true)
  }

  const openEdit = (er: EmployeeRecord) => {
    setEditId(er.id)
    setForm({
      employeeId: er.employeeId,
      recordType: 'WORK',
      title: er.title,
      organization: er.organization ?? '',
      startDate: er.startDate ?? '',
      endDate: er.endDate ?? '',
      description: er.description ?? '',
      note: er.note ?? '',
    })
    setOpen(true)
  }

  const onDelete = (er: EmployeeRecord) => {
    if (!confirm(`[${er.code}] 항목을 삭제하시겠습니까?`)) return
    remove.mutate(er.id, {
      onSuccess: () => toast.success('삭제했습니다.'),
      onError: () => toast.error('삭제에 실패했습니다.'),
    })
  }

  const submit = () => {
    if (!form.employeeId || !form.title) {
      toast.error('직원과 업무명은 필수입니다.')
      return
    }
    const body: EmployeeRecordInput = {
      ...form,
      recordType: 'WORK',
      organization: form.organization || null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      description: form.description || null,
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
            <h2 className='text-2xl font-bold tracking-tight'>업무이력사항</h2>
            <p className='text-muted-foreground'>
              05.인사 / 인적사항 — 업무이력
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
              <Plus size={16} /> 항목 등록
            </Button>
          </div>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-36'>코드</TableHead>
                <TableHead>직원</TableHead>
                <TableHead className='w-20'>구분</TableHead>
                <TableHead>업무명</TableHead>
                <TableHead>소속/팀</TableHead>
                <TableHead className='w-52'>기간</TableHead>
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
                rows.map((er) => (
                  <TableRow key={er.id}>
                    <TableCell className='font-medium'>{er.code}</TableCell>
                    <TableCell>
                      {er.employeeName}
                      {er.departmentName && (
                        <span className='ml-1 text-xs text-muted-foreground'>
                          ({er.departmentName})
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline'>
                        {RECORD_TYPE[er.recordType]}
                      </Badge>
                    </TableCell>
                    <TableCell>{er.title}</TableCell>
                    <TableCell>{er.organization ?? '-'}</TableCell>
                    <TableCell>
                      {er.startDate ?? '-'} ~ {er.endDate ?? '진행 중'}
                    </TableCell>
                    <TableCell className='text-end'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => openEdit(er)}
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => onDelete(er)}
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
              {editId ? '업무이력 수정' : '업무이력 등록'}
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
            <Field label='업무명'>
              <Input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                maxLength={200}
                placeholder='업무 또는 프로젝트명'
              />
            </Field>
            <Field label='소속/팀'>
              <Input
                value={form.organization ?? ''}
                onChange={(e) => set('organization', e.target.value)}
                maxLength={200}
                placeholder='담당 팀 또는 조직'
              />
            </Field>
            <Field label='시작일'>
              <Input
                type='date'
                value={form.startDate ?? ''}
                onChange={(e) => set('startDate', e.target.value)}
              />
            </Field>
            <Field label='종료일'>
              <Input
                type='date'
                value={form.endDate ?? ''}
                onChange={(e) => set('endDate', e.target.value)}
              />
            </Field>
            <Field label='설명'>
              <Input
                value={form.description ?? ''}
                onChange={(e) => set('description', e.target.value)}
                maxLength={500}
                placeholder='담당 역할, 성과 등'
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
