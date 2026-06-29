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
  useEducationRequests,
  useSaveEducationRequest,
  useDeleteEducationRequest,
  useEmployees,
  EDU_STATUS,
  won,
  type EducationRequest,
  type EducationRequestInput,
  type EducationStatus,
} from './api'

const EMPTY: EducationRequestInput = {
  employeeId: 0,
  eduType: 'CERT',
  title: '',
  institution: '',
  startDate: '',
  endDate: '',
  cost: 0,
  status: 'REQUESTED',
  result: '',
  note: '',
}

const STATUS_ITEMS = (
  Object.entries(EDU_STATUS) as [EducationStatus, string][]
).map(([value, label]) => ({ label, value }))

export function CertApplyPage() {
  const [filterEmpId, setFilterEmpId] = useState<number | undefined>(undefined)

  const { data: allRows, isLoading } = useEducationRequests({
    eduType: 'CERT',
    employeeId: filterEmpId,
  })
  const { data: employees } = useEmployees()
  const save = useSaveEducationRequest()
  const del = useDeleteEducationRequest()

  const rows = allRows ?? []

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | undefined>(undefined)
  const [form, setForm] = useState<EducationRequestInput>(EMPTY)

  const empItems = (employees ?? []).map((e) => ({
    label: `${e.name} (${e.employeeNo})`,
    value: String(e.id),
  }))

  const set = (k: keyof EducationRequestInput, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }))

  const openCreate = () => {
    setEditId(undefined)
    setForm({
      ...EMPTY,
      employeeId: employees?.[0]?.id ?? 0,
    })
    setOpen(true)
  }

  const openEdit = (er: EducationRequest) => {
    setEditId(er.id)
    setForm({
      employeeId: er.employeeId,
      eduType: 'CERT',
      title: er.title,
      institution: er.institution ?? '',
      startDate: er.startDate ?? '',
      endDate: er.endDate ?? '',
      cost: er.cost,
      status: er.status,
      result: er.result ?? '',
      note: er.note ?? '',
    })
    setOpen(true)
  }

  const onDelete = (er: EducationRequest) => {
    if (!confirm(`[${er.code}] 신청을 삭제하시겠습니까?`)) return
    del.mutate(er.id, {
      onSuccess: () => toast.success('삭제했습니다.'),
      onError: () => toast.error('삭제에 실패했습니다.'),
    })
  }

  const submit = () => {
    if (!form.employeeId || !form.title) {
      toast.error('직원과 자격명은 필수입니다.')
      return
    }
    const body: EducationRequestInput = {
      ...form,
      eduType: 'CERT',
      institution: form.institution || null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      result: form.result || null,
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
            <h2 className='text-2xl font-bold tracking-tight'>
              비즈니스자격신청
            </h2>
            <p className='text-muted-foreground'>
              05.인사 / 교육관리 — 비즈니스자격신청
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
                <TableHead>자격명</TableHead>
                <TableHead className='w-40'>주관기관</TableHead>
                <TableHead className='w-52'>기간</TableHead>
                <TableHead className='w-28 text-end'>응시비(원)</TableHead>
                <TableHead className='w-20'>상태</TableHead>
                <TableHead className='w-40'>결과</TableHead>
                <TableHead className='w-28 text-end'>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className='h-24 text-center'>
                    불러오는 중…
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className='h-24 text-center'>
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
                    <TableCell>{er.title}</TableCell>
                    <TableCell>{er.institution ?? '-'}</TableCell>
                    <TableCell>
                      {er.startDate ?? '-'}
                      {er.endDate ? ` ~ ${er.endDate}` : ''}
                    </TableCell>
                    <TableCell className='text-end'>{won(er.cost)}</TableCell>
                    <TableCell>
                      <Badge variant='outline'>{EDU_STATUS[er.status]}</Badge>
                    </TableCell>
                    <TableCell>{er.result ?? '-'}</TableCell>
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
            <SheetTitle>{editId ? '자격 수정' : '자격 신청'}</SheetTitle>
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
            <Field label='자격명'>
              <Input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                maxLength={200}
                placeholder='자격증명을 입력하세요'
              />
            </Field>
            <Field label='주관기관'>
              <Input
                value={form.institution ?? ''}
                onChange={(e) => set('institution', e.target.value)}
                maxLength={200}
              />
            </Field>
            <Field label='시험일'>
              <Input
                type='date'
                value={form.startDate ?? ''}
                onChange={(e) => set('startDate', e.target.value)}
              />
            </Field>
            <Field label='결과발표일'>
              <Input
                type='date'
                value={form.endDate ?? ''}
                onChange={(e) => set('endDate', e.target.value)}
              />
            </Field>
            <Field label='응시비(원)'>
              <Input
                type='number'
                min='0'
                value={form.cost ?? 0}
                onChange={(e) =>
                  set('cost', e.target.value ? Number(e.target.value) : 0)
                }
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
            <Field label='결과'>
              <Input
                value={form.result ?? ''}
                onChange={(e) => set('result', e.target.value)}
                maxLength={200}
                placeholder='예: 합격, 불합격'
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
