import { useState } from 'react'
import { Pencil, Pin, Plus, Trash2 } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { SelectDropdown } from '@/components/select-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  useNotices,
  useSaveNotice,
  useDeleteNotice,
  NOTICE_CATEGORY,
  type Notice,
  type NoticeInput,
  type NoticeCategory,
} from './api'

const EMPTY: NoticeInput = {
  title: '',
  content: '',
  author: '',
  category: 'GENERAL',
  postedDate: '',
  pinned: false,
}

const CATEGORY_ITEMS = (
  Object.entries(NOTICE_CATEGORY) as [NoticeCategory, string][]
).map(([value, label]) => ({ label, value }))

export function NoticePage() {
  const [keyword, setKeyword] = useState('')
  const [filterCategory, setFilterCategory] = useState<
    NoticeCategory | undefined
  >(undefined)
  const { data: rows, isLoading } = useNotices({
    keyword: keyword || undefined,
    category: filterCategory,
  })
  const save = useSaveNotice()
  const remove = useDeleteNotice()

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | undefined>(undefined)
  const [form, setForm] = useState<NoticeInput>(EMPTY)

  const set = (k: keyof NoticeInput, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }))

  const openCreate = () => {
    setEditId(undefined)
    setForm(EMPTY)
    setOpen(true)
  }

  const openEdit = (n: Notice) => {
    setEditId(n.id)
    setForm({
      title: n.title,
      content: n.content ?? '',
      author: n.author ?? '',
      category: n.category,
      postedDate: n.postedDate ?? '',
      pinned: n.pinned,
    })
    setOpen(true)
  }

  const submit = () => {
    if (!form.title.trim()) {
      toast.error('제목은 필수입니다.')
      return
    }
    save.mutate(
      { id: editId, body: { ...form, postedDate: form.postedDate || null } },
      {
        onSuccess: () => {
          toast.success(
            editId ? '공지를 수정했습니다.' : '공지를 등록했습니다.'
          )
          setOpen(false)
        },
        onError: () => toast.error('저장에 실패했습니다.'),
      }
    )
  }

  const onDelete = (n: Notice) => {
    if (!confirm(`공지 [${n.code}]을(를) 삭제하시겠습니까?`)) return
    remove.mutate(n.id, {
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
            <h2 className='text-2xl font-bold tracking-tight'>
              시스템안내 / 공지
            </h2>
            <p className='text-muted-foreground'>08.공통 / 공지 관리</p>
          </div>
          <div className='flex items-end gap-2'>
            <SelectDropdown
              defaultValue=''
              onValueChange={(v) =>
                setFilterCategory((v as NoticeCategory) || undefined)
              }
              placeholder='전체 분류'
              items={[{ label: '전체', value: '' }, ...CATEGORY_ITEMS]}
              className='w-32'
            />
            <Input
              placeholder='제목·내용 검색'
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className='w-48'
            />
            <Button onClick={openCreate}>
              <Plus size={16} /> 공지 등록
            </Button>
          </div>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-32'>공지번호</TableHead>
                <TableHead className='w-24'>분류</TableHead>
                <TableHead>제목</TableHead>
                <TableHead className='w-24'>작성자</TableHead>
                <TableHead className='w-28'>게시일</TableHead>
                <TableHead className='w-20 text-center'>고정</TableHead>
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
                (rows ?? []).map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className='font-medium'>{n.code}</TableCell>
                    <TableCell>
                      <Badge variant='outline'>
                        {NOTICE_CATEGORY[n.category]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className='flex items-center gap-1'>
                        {n.pinned && (
                          <Pin size={13} className='shrink-0 text-primary' />
                        )}
                        {n.title}
                      </span>
                    </TableCell>
                    <TableCell>{n.author ?? '-'}</TableCell>
                    <TableCell>{n.postedDate ?? '-'}</TableCell>
                    <TableCell className='text-center'>
                      {n.pinned ? <Badge variant='secondary'>고정</Badge> : '-'}
                    </TableCell>
                    <TableCell className='text-end'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => openEdit(n)}
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => onDelete(n)}
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
            <SheetTitle>{editId ? '공지 수정' : '공지 등록'}</SheetTitle>
          </SheetHeader>
          <div className='flex-1 space-y-4 overflow-y-auto px-4'>
            <Field label='분류'>
              <SelectDropdown
                defaultValue={form.category}
                onValueChange={(v) => set('category', v)}
                placeholder='분류 선택'
                items={CATEGORY_ITEMS}
              />
            </Field>
            <Field label='제목'>
              <Input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder='공지 제목'
              />
            </Field>
            <Field label='본문'>
              <Textarea
                value={form.content ?? ''}
                onChange={(e) => set('content', e.target.value)}
                placeholder='공지 내용을 입력하세요.'
                rows={6}
              />
            </Field>
            <Field label='작성자'>
              <Input
                value={form.author ?? ''}
                onChange={(e) => set('author', e.target.value)}
                placeholder='작성자'
              />
            </Field>
            <Field label='게시일'>
              <Input
                type='date'
                value={form.postedDate ?? ''}
                onChange={(e) => set('postedDate', e.target.value)}
              />
            </Field>
            <div className='flex items-center gap-2'>
              <input
                id='pinned'
                type='checkbox'
                checked={form.pinned}
                onChange={(e) => set('pinned', e.target.checked)}
                className='h-4 w-4'
              />
              <label htmlFor='pinned' className='text-sm font-medium'>
                상단 고정
              </label>
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
