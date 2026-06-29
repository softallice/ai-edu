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
  useCommonCodes,
  useSaveCommonCode,
  useDeleteCommonCode,
  type CommonCode,
  type CommonCodeInput,
} from './api'

const EMPTY: CommonCodeInput = {
  codeGroup: '',
  code: '',
  name: '',
  sortOrder: 0,
  useYn: true,
  description: '',
}

const USE_YN_ITEMS = [
  { label: '사용', value: 'true' },
  { label: '미사용', value: 'false' },
]

export function CommonCodePage() {
  const [keyword, setKeyword] = useState('')
  const { data: rows, isLoading } = useCommonCodes({
    keyword: keyword || undefined,
  })
  const save = useSaveCommonCode()
  const remove = useDeleteCommonCode()

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | undefined>(undefined)
  const [form, setForm] = useState<CommonCodeInput>(EMPTY)

  const set = (k: keyof CommonCodeInput, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }))

  const openCreate = () => {
    setEditId(undefined)
    setForm(EMPTY)
    setOpen(true)
  }

  const openEdit = (c: CommonCode) => {
    setEditId(c.id)
    setForm({
      codeGroup: c.codeGroup,
      code: c.code,
      name: c.name,
      sortOrder: c.sortOrder,
      useYn: c.useYn,
      description: c.description ?? '',
    })
    setOpen(true)
  }

  const submit = () => {
    if (!form.codeGroup.trim()) {
      toast.error('코드그룹은 필수입니다.')
      return
    }
    if (!form.code.trim()) {
      toast.error('코드는 필수입니다.')
      return
    }
    if (!form.name.trim()) {
      toast.error('코드명은 필수입니다.')
      return
    }
    save.mutate(
      { id: editId, body: { ...form, description: form.description || null } },
      {
        onSuccess: () => {
          toast.success(editId ? '공통코드를 수정했습니다.' : '공통코드를 등록했습니다.')
          setOpen(false)
        },
        onError: () => toast.error('저장에 실패했습니다.'),
      }
    )
  }

  const onDelete = (c: CommonCode) => {
    if (!confirm(`코드 [${c.codeGroup}/${c.code}]을(를) 삭제하시겠습니까?`)) return
    remove.mutate(c.id, {
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
            <h2 className='text-2xl font-bold tracking-tight'>공통코드관리</h2>
            <p className='text-muted-foreground'>08.공통 / 공통운영 / 공통코드관리</p>
          </div>
          <div className='flex items-end gap-2'>
            <Input
              placeholder='코드·코드명 검색'
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className='w-48'
            />
            <Button onClick={openCreate}>
              <Plus size={16} /> 코드 등록
            </Button>
          </div>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-36'>코드그룹</TableHead>
                <TableHead className='w-32'>코드</TableHead>
                <TableHead>코드명</TableHead>
                <TableHead className='w-16 text-center'>정렬</TableHead>
                <TableHead className='w-24 text-center'>사용여부</TableHead>
                <TableHead>설명</TableHead>
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
                (rows ?? []).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className='font-medium'>{c.codeGroup}</TableCell>
                    <TableCell>{c.code}</TableCell>
                    <TableCell>{c.name}</TableCell>
                    <TableCell className='text-center'>{c.sortOrder}</TableCell>
                    <TableCell className='text-center'>
                      <Badge variant={c.useYn ? 'default' : 'outline'}>
                        {c.useYn ? '사용' : '미사용'}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-muted-foreground'>
                      {c.description ?? '-'}
                    </TableCell>
                    <TableCell className='text-end'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => openEdit(c)}
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => onDelete(c)}
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
            <SheetTitle>{editId ? '공통코드 수정' : '공통코드 등록'}</SheetTitle>
          </SheetHeader>
          <div className='flex-1 space-y-4 overflow-y-auto px-4'>
            <Field label='코드그룹'>
              <Input
                value={form.codeGroup}
                onChange={(e) => set('codeGroup', e.target.value)}
                placeholder='예: EXPENSE_TYPE'
                disabled={!!editId}
              />
            </Field>
            <Field label='코드'>
              <Input
                value={form.code}
                onChange={(e) => set('code', e.target.value)}
                placeholder='예: MEAL'
                disabled={!!editId}
              />
            </Field>
            <Field label='코드명'>
              <Input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder='코드 표시 이름'
              />
            </Field>
            <Field label='정렬순서'>
              <Input
                type='number'
                value={form.sortOrder}
                onChange={(e) => set('sortOrder', Number(e.target.value))}
              />
            </Field>
            <Field label='사용여부'>
              <SelectDropdown
                defaultValue={String(form.useYn)}
                onValueChange={(v) => set('useYn', v === 'true')}
                placeholder='사용여부 선택'
                items={USE_YN_ITEMS}
              />
            </Field>
            <Field label='설명'>
              <Input
                value={form.description ?? ''}
                onChange={(e) => set('description', e.target.value)}
                placeholder='코드 설명 (선택)'
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
