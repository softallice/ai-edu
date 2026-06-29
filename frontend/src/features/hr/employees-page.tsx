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
import { SelectDropdown } from '@/components/select-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  useEmployees,
  useDepartments,
  useSaveEmployee,
  useDeleteEmployee,
  POSITIONS,
  EMPLOYMENT_TYPES,
  type Employee,
  type EmployeeInput,
} from './api'

const EMPTY: EmployeeInput = {
  employeeNo: '',
  name: '',
  active: true,
  departmentId: null,
  position: 'STAFF',
  employmentType: 'REGULAR',
  hireDate: '',
  workEmail: '',
  mobile: '',
}

export function EmployeesPage() {
  const [keyword, setKeyword] = useState('')
  const { data: employees, isLoading } = useEmployees(keyword || undefined)
  const { data: departments } = useDepartments()
  const save = useSaveEmployee()
  const remove = useDeleteEmployee()

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | undefined>(undefined)
  const [form, setForm] = useState<EmployeeInput>(EMPTY)

  const deptItems = (departments ?? []).map((d) => ({ label: d.name, value: String(d.id) }))
  const set = (k: keyof EmployeeInput, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const openCreate = () => {
    setEditId(undefined)
    setForm(EMPTY)
    setOpen(true)
  }
  const openEdit = (e: Employee) => {
    setEditId(e.id)
    setForm({
      employeeNo: e.employeeNo,
      name: e.name,
      active: e.active,
      departmentId: e.departmentId,
      position: e.position,
      employmentType: e.employmentType,
      hireDate: e.hireDate ?? '',
      workEmail: e.workEmail ?? '',
      mobile: e.mobile ?? '',
    })
    setOpen(true)
  }
  const submit = () => {
    if (!form.employeeNo || !form.name) {
      toast.error('사번과 이름은 필수입니다.')
      return
    }
    save.mutate(
      { id: editId, body: { ...form, hireDate: form.hireDate || null } },
      {
        onSuccess: () => {
          toast.success(editId ? '직원을 수정했습니다.' : '직원을 등록했습니다.')
          setOpen(false)
        },
      }
    )
  }
  const onDelete = (e: Employee) => {
    if (!confirm(`직원 [${e.name}]을(를) 삭제하시겠습니까?`)) return
    remove.mutate(e.id, { onSuccess: () => toast.success('삭제했습니다.') })
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
            <h2 className='text-2xl font-bold tracking-tight'>직원</h2>
            <p className='text-muted-foreground'>인사 마스터 — koerp /hr/employees 이관</p>
          </div>
          <div className='flex gap-2'>
            <Input
              placeholder='사번·이름 검색'
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className='w-48'
            />
            <Button onClick={openCreate}>
              <Plus size={16} /> 직원 등록
            </Button>
          </div>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>사번</TableHead>
                <TableHead>이름</TableHead>
                <TableHead>부서</TableHead>
                <TableHead>직급</TableHead>
                <TableHead>고용형태</TableHead>
                <TableHead>입사일</TableHead>
                <TableHead>상태</TableHead>
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
              ) : (employees ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className='h-24 text-center'>
                    결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                (employees ?? []).map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className='font-medium'>{e.employeeNo}</TableCell>
                    <TableCell>{e.name}</TableCell>
                    <TableCell>{e.departmentName ?? '-'}</TableCell>
                    <TableCell>{POSITIONS[e.position] ?? e.position}</TableCell>
                    <TableCell>{EMPLOYMENT_TYPES[e.employmentType] ?? e.employmentType}</TableCell>
                    <TableCell>{e.hireDate ?? '-'}</TableCell>
                    <TableCell>
                      <Badge variant={e.active ? 'default' : 'outline'}>
                        {e.active ? '재직' : '퇴사'}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-end'>
                      <Button variant='ghost' size='icon' onClick={() => openEdit(e)}>
                        <Pencil size={15} />
                      </Button>
                      <Button variant='ghost' size='icon' onClick={() => onDelete(e)}>
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
            <SheetTitle>{editId ? '직원 수정' : '직원 등록'}</SheetTitle>
          </SheetHeader>
          <div className='flex-1 space-y-4 overflow-y-auto px-4'>
            <Field label='사번'>
              <Input value={form.employeeNo} onChange={(e) => set('employeeNo', e.target.value)} />
            </Field>
            <Field label='이름'>
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} />
            </Field>
            <Field label='부서'>
              <SelectDropdown
                defaultValue={form.departmentId ? String(form.departmentId) : ''}
                onValueChange={(v) => set('departmentId', v ? Number(v) : null)}
                placeholder='부서 선택'
                items={deptItems}
              />
            </Field>
            <Field label='직급'>
              <SelectDropdown
                defaultValue={form.position}
                onValueChange={(v) => set('position', v)}
                placeholder='직급'
                items={Object.entries(POSITIONS).map(([value, label]) => ({ label, value }))}
              />
            </Field>
            <Field label='고용형태'>
              <SelectDropdown
                defaultValue={form.employmentType}
                onValueChange={(v) => set('employmentType', v)}
                placeholder='고용형태'
                items={Object.entries(EMPLOYMENT_TYPES).map(([value, label]) => ({ label, value }))}
              />
            </Field>
            <Field label='입사일'>
              <Input type='date' value={form.hireDate ?? ''} onChange={(e) => set('hireDate', e.target.value)} />
            </Field>
            <Field label='업무 이메일'>
              <Input value={form.workEmail ?? ''} onChange={(e) => set('workEmail', e.target.value)} />
            </Field>
            <Field label='휴대폰'>
              <Input value={form.mobile ?? ''} onChange={(e) => set('mobile', e.target.value)} />
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className='space-y-1'>
      <label className='text-sm font-medium'>{label}</label>
      {children}
    </div>
  )
}

import { Search } from '@/components/search'
