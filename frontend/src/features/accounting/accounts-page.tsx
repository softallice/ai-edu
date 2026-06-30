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
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { SelectDropdown } from '@/components/select-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  useAccounts,
  useSaveAccount,
  useDeleteAccount,
  ACCOUNT_TYPE_LABEL,
  type Account,
  type AccountInput,
  type AccountType,
} from './api'

const TYPE_OPTIONS = [
  { label: '자산', value: 'ASSET' },
  { label: '부채', value: 'LIABILITY' },
  { label: '자본', value: 'EQUITY' },
  { label: '수익', value: 'INCOME' },
  { label: '비용', value: 'EXPENSE' },
]

const EMPTY: AccountInput = { code: '', name: '', type: 'ASSET', active: true }

export function AccountsPage() {
  const [keyword, setKeyword] = useState('')
  const [typeFilter, setTypeFilter] = useState<AccountType | ''>('')

  const { data: rows, isLoading } = useAccounts({
    keyword: keyword || undefined,
    type: typeFilter || undefined,
  })
  const save = useSaveAccount()
  const remove = useDeleteAccount()

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | undefined>(undefined)
  const [form, setForm] = useState<AccountInput>(EMPTY)

  const set = (k: keyof AccountInput, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }))

  const openCreate = () => {
    setEditId(undefined)
    setForm(EMPTY)
    setOpen(true)
  }

  const openEdit = (a: Account) => {
    setEditId(a.id)
    setForm({ code: a.code, name: a.name, type: a.type, active: a.active })
    setOpen(true)
  }

  const submit = () => {
    if (!form.code.trim()) {
      toast.error('계정코드는 필수입니다.')
      return
    }
    if (!form.name.trim()) {
      toast.error('계정명은 필수입니다.')
      return
    }
    save.mutate(
      { id: editId, body: form },
      {
        onSuccess: () => {
          toast.success(
            editId ? '계정과목을 수정했습니다.' : '계정과목을 등록했습니다.'
          )
          setOpen(false)
        },
        onError: () => toast.error('저장에 실패했습니다.'),
      }
    )
  }

  const onDelete = (a: Account) => {
    if (!confirm(`계정과목 [${a.code} ${a.name}]을(를) 삭제하시겠습니까?`))
      return
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
        <ProfileDropdown />
      </Header>
      <Main className='flex flex-1 flex-col gap-4'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>계정과목관리</h2>
            <p className='text-muted-foreground'>04.재무 / 회계 / 계정과목</p>
          </div>
          <div className='flex flex-wrap items-end gap-2'>
            <Input
              placeholder='코드·계정명 검색'
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className='w-48'
            />
            <SelectDropdown
              defaultValue={typeFilter}
              onValueChange={(v) => setTypeFilter(v as AccountType | '')}
              placeholder='유형 전체'
              items={TYPE_OPTIONS}
            />
            <Button onClick={openCreate}>
              <Plus size={16} /> 계정 등록
            </Button>
          </div>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-32'>코드</TableHead>
                <TableHead>계정명</TableHead>
                <TableHead className='w-24'>유형</TableHead>
                <TableHead className='w-24'>사용여부</TableHead>
                <TableHead className='w-24 text-end'>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className='h-24 text-center'>
                    불러오는 중…
                  </TableCell>
                </TableRow>
              ) : (rows ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className='h-24 text-center'>
                    결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                (rows ?? []).map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className='font-medium'>{a.code}</TableCell>
                    <TableCell>{a.name}</TableCell>
                    <TableCell>
                      <Badge variant='secondary'>
                        {ACCOUNT_TYPE_LABEL[a.type]}
                      </Badge>
                    </TableCell>
                    <TableCell>{a.active ? '사용' : '미사용'}</TableCell>
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
              {editId ? '계정과목 수정' : '계정과목 등록'}
            </SheetTitle>
          </SheetHeader>
          <div className='flex-1 space-y-4 overflow-y-auto px-4'>
            <Field label='계정코드'>
              <Input
                value={form.code}
                onChange={(e) => set('code', e.target.value)}
                placeholder='예: 1101'
                disabled={!!editId}
              />
            </Field>
            <Field label='계정명'>
              <Input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder='예: 현금'
              />
            </Field>
            <Field label='유형'>
              <SelectDropdown
                defaultValue={form.type}
                onValueChange={(v) => set('type', v as AccountType)}
                placeholder='유형 선택'
                items={TYPE_OPTIONS}
              />
            </Field>
            <Field label='사용여부'>
              <label className='flex items-center gap-2 text-sm'>
                <input
                  type='checkbox'
                  checked={form.active ?? true}
                  onChange={(e) => set('active', e.target.checked)}
                  className='h-4 w-4'
                />
                사용중
              </label>
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
