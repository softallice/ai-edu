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
  useDepartments,
  useSaveDepartment,
  useDeleteDepartment,
  type Department,
  type DepartmentInput,
} from './api'

const EMPTY: DepartmentInput = { code: '', name: '', sequence: 10, active: true, parentId: null }

export function DepartmentsPage() {
  const { data: departments, isLoading } = useDepartments()
  const save = useSaveDepartment()
  const remove = useDeleteDepartment()
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | undefined>(undefined)
  const [form, setForm] = useState<DepartmentInput>(EMPTY)

  const set = (k: keyof DepartmentInput, v: unknown) => setForm((f) => ({ ...f, [k]: v }))
  const parentItems = (departments ?? [])
    .filter((d) => d.id !== editId)
    .map((d) => ({ label: d.name, value: String(d.id) }))

  const openCreate = () => {
    setEditId(undefined)
    setForm(EMPTY)
    setOpen(true)
  }
  const openEdit = (d: Department) => {
    setEditId(d.id)
    setForm({ code: d.code, name: d.name, sequence: d.sequence, active: d.active, parentId: d.parentId })
    setOpen(true)
  }
  const submit = () => {
    if (!form.code || !form.name) {
      toast.error('부서코드와 부서명은 필수입니다.')
      return
    }
    save.mutate(
      { id: editId, body: form },
      {
        onSuccess: () => {
          toast.success(editId ? '부서를 수정했습니다.' : '부서를 등록했습니다.')
          setOpen(false)
        },
      }
    )
  }
  const onDelete = (d: Department) => {
    if (!confirm(`부서 [${d.name}]을(를) 삭제하시겠습니까?`)) return
    remove.mutate(d.id, { onSuccess: () => toast.success('삭제했습니다.') })
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
            <h2 className='text-2xl font-bold tracking-tight'>부서</h2>
            <p className='text-muted-foreground'>조직 마스터 — koerp /hr/departments 이관</p>
          </div>
          <Button onClick={openCreate}>
            <Plus size={16} /> 부서 등록
          </Button>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>코드</TableHead>
                <TableHead>부서명</TableHead>
                <TableHead>상위부서</TableHead>
                <TableHead>순서</TableHead>
                <TableHead>상태</TableHead>
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
              ) : (departments ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className='h-24 text-center'>
                    결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                (departments ?? []).map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className='font-medium'>{d.code}</TableCell>
                    <TableCell>{d.name}</TableCell>
                    <TableCell>{d.parentName ?? '-'}</TableCell>
                    <TableCell>{d.sequence}</TableCell>
                    <TableCell>
                      <Badge variant={d.active ? 'default' : 'outline'}>
                        {d.active ? '사용' : '미사용'}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-end'>
                      <Button variant='ghost' size='icon' onClick={() => openEdit(d)}>
                        <Pencil size={15} />
                      </Button>
                      <Button variant='ghost' size='icon' onClick={() => onDelete(d)}>
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
            <SheetTitle>{editId ? '부서 수정' : '부서 등록'}</SheetTitle>
          </SheetHeader>
          <div className='flex-1 space-y-4 overflow-y-auto px-4'>
            <div className='space-y-1'>
              <label className='text-sm font-medium'>부서코드</label>
              <Input value={form.code} onChange={(e) => set('code', e.target.value)} />
            </div>
            <div className='space-y-1'>
              <label className='text-sm font-medium'>부서명</label>
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} />
            </div>
            <div className='space-y-1'>
              <label className='text-sm font-medium'>상위부서</label>
              <SelectDropdown
                defaultValue={form.parentId ? String(form.parentId) : ''}
                onValueChange={(v) => set('parentId', v ? Number(v) : null)}
                placeholder='상위부서 (없으면 최상위)'
                items={parentItems}
              />
            </div>
            <div className='space-y-1'>
              <label className='text-sm font-medium'>순서</label>
              <Input
                type='number'
                value={form.sequence ?? 10}
                onChange={(e) => set('sequence', Number(e.target.value))}
              />
            </div>
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
