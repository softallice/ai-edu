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
  useSealRequests,
  useSaveSealRequest,
  useDeleteSealRequest,
  useEmployees,
  SEAL_STATUS,
  type SealRequest,
  type SealRequestInput,
  type SealType,
  type SealStatus,
} from './api'

type Props = {
  fixedType: SealType
  title: string
  subtitle: string
}

const STATUS_ITEMS = (
  Object.entries(SEAL_STATUS) as [SealStatus, string][]
).map(([value, label]) => ({ label, value }))

function emptyForm(fixedType: SealType, defaultEmployeeId = 0): SealRequestInput {
  return {
    employeeId: defaultEmployeeId,
    sealType: fixedType,
    title: '',
    purpose: '',
    useDate: '',
    status: 'REQUESTED',
  }
}

export function SealTypePage({ fixedType, title, subtitle }: Props) {
  const [keyword, setKeyword] = useState('')
  const { data: rows, isLoading } = useSealRequests({
    sealType: fixedType,
    keyword: keyword || undefined,
  })
  const { data: employees } = useEmployees()
  const save = useSaveSealRequest()
  const remove = useDeleteSealRequest()

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | undefined>(undefined)
  const [form, setForm] = useState<SealRequestInput>(emptyForm(fixedType))

  const empItems = (employees ?? []).map((e) => ({
    label: `${e.name} (${e.employeeNo})`,
    value: String(e.id),
  }))

  const set = (k: keyof SealRequestInput, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }))

  const openCreate = () => {
    setEditId(undefined)
    setForm(emptyForm(fixedType, employees?.[0]?.id ?? 0))
    setOpen(true)
  }

  const openEdit = (r: SealRequest) => {
    setEditId(r.id)
    setForm({
      employeeId: r.employeeId,
      sealType: fixedType,
      title: r.title,
      purpose: r.purpose ?? '',
      useDate: r.useDate ?? '',
      status: r.status,
    })
    setOpen(true)
  }

  const submit = () => {
    if (!form.employeeId || !form.title.trim()) {
      toast.error('신청자, 제목은 필수입니다.')
      return
    }
    save.mutate(
      {
        id: editId,
        body: {
          ...form,
          sealType: fixedType,
          useDate: form.useDate || null,
          purpose: form.purpose || null,
        },
      },
      {
        onSuccess: () => {
          toast.success(editId ? '수정했습니다.' : '등록했습니다.')
          setOpen(false)
        },
        onError: () => toast.error('저장에 실패했습니다.'),
      }
    )
  }

  const onDelete = (r: SealRequest) => {
    if (!confirm(`[${r.code}]을(를) 삭제하시겠습니까?`)) return
    remove.mutate(r.id, {
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
            <h2 className='text-2xl font-bold tracking-tight'>{title}</h2>
            <p className='text-muted-foreground'>{subtitle}</p>
          </div>
          <div className='flex items-end gap-2'>
            <Input
              placeholder='번호·제목 검색'
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className='w-48'
            />
            <Button onClick={openCreate}>
              <Plus size={16} /> {title} 등록
            </Button>
          </div>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-36'>번호</TableHead>
                <TableHead className='w-32'>신청자</TableHead>
                <TableHead>제목</TableHead>
                <TableHead className='w-28'>사용예정일</TableHead>
                <TableHead className='w-20'>상태</TableHead>
                <TableHead className='w-24 text-end'>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className='h-24 text-center'>
                    불러오는 중…
                  </TableCell>
                </TableRow>
              ) : (rows ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className='h-24 text-center'>
                    결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                (rows ?? []).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className='font-medium'>{r.code}</TableCell>
                    <TableCell>{r.employeeName}</TableCell>
                    <TableCell>{r.title}</TableCell>
                    <TableCell>{r.useDate ?? '-'}</TableCell>
                    <TableCell>
                      <Badge variant='outline'>
                        {SEAL_STATUS[r.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-end'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => openEdit(r)}
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => onDelete(r)}
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
              {editId ? `${title} 수정` : `${title} 등록`}
            </SheetTitle>
          </SheetHeader>
          <div className='flex-1 space-y-4 overflow-y-auto px-4'>
            <Field label='신청자'>
              <SelectDropdown
                defaultValue={form.employeeId ? String(form.employeeId) : ''}
                onValueChange={(v) => set('employeeId', v ? Number(v) : 0)}
                placeholder='직원 선택'
                items={empItems}
              />
            </Field>
            <Field label='제목'>
              <Input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder='제목을 입력하세요'
              />
            </Field>
            <Field label='사용목적/반출처'>
              <Input
                value={form.purpose ?? ''}
                onChange={(e) => set('purpose', e.target.value)}
                placeholder='사용목적 또는 반출처를 입력하세요'
              />
            </Field>
            <Field label='사용예정일'>
              <Input
                type='date'
                value={form.useDate ?? ''}
                onChange={(e) => set('useDate', e.target.value)}
              />
            </Field>
            <Field label='상태'>
              <SelectDropdown
                defaultValue={form.status}
                onValueChange={(v) => set('status', v as SealStatus)}
                placeholder='상태'
                items={STATUS_ITEMS}
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
