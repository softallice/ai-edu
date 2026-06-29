import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
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
  useVouchers,
  useSaveVoucher,
  useDeleteVoucher,
  useProjects,
  won,
  type Voucher,
  type VoucherInput,
} from './api'

const pad = (n: number) => String(n).padStart(2, '0')
const ymd = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

const EMPTY: VoucherInput = {
  voucherDate: ymd(new Date()),
  account: '',
  debit: 0,
  credit: 0,
  description: '',
  projectId: null,
}

export function VoucherByDatePage() {
  const now = new Date()
  const [keyword, setKeyword] = useState('')
  const [dateFrom, setDateFrom] = useState(
    ymd(new Date(now.getFullYear(), now.getMonth(), 1))
  )
  const [dateTo, setDateTo] = useState(
    ymd(new Date(now.getFullYear(), now.getMonth() + 1, 0))
  )

  const { data: rows, isLoading } = useVouchers({
    keyword: keyword || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  })
  const { data: projects } = useProjects()
  const save = useSaveVoucher()
  const remove = useDeleteVoucher()

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | undefined>(undefined)
  const [form, setForm] = useState<VoucherInput>(EMPTY)

  const projectItems = (projects ?? []).map((p) => ({
    label: `${p.code} ${p.name}`,
    value: String(p.id),
  }))

  const set = (k: keyof VoucherInput, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }))

  const openCreate = () => {
    setEditId(undefined)
    setForm({ ...EMPTY, voucherDate: ymd(new Date()) })
    setOpen(true)
  }

  const openEdit = (v: Voucher) => {
    setEditId(v.id)
    setForm({
      voucherDate: v.voucherDate,
      account: v.account,
      debit: v.debit,
      credit: v.credit,
      description: v.description ?? '',
      projectId: v.projectId,
    })
    setOpen(true)
  }

  const submit = () => {
    if (!form.account.trim()) {
      toast.error('계정과목은 필수입니다.')
      return
    }
    if (!form.voucherDate) {
      toast.error('전표 일자는 필수입니다.')
      return
    }
    save.mutate(
      { id: editId, body: form },
      {
        onSuccess: () => {
          toast.success(
            editId ? '전표를 수정했습니다.' : '전표를 등록했습니다.'
          )
          setOpen(false)
        },
        onError: () => toast.error('저장에 실패했습니다.'),
      }
    )
  }

  const onDelete = (v: Voucher) => {
    if (!confirm(`전표 [${v.code}]을(를) 삭제하시겠습니까?`)) return
    remove.mutate(v.id, {
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
            <h2 className='text-2xl font-bold tracking-tight'>전표 — 일자별</h2>
            <p className='text-muted-foreground'>04.재무 / 전표 등록 및 조회</p>
          </div>
          <div className='flex flex-wrap items-end gap-2'>
            <Input
              placeholder='전표번호·계정과목 검색'
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className='w-48'
            />
            <Input
              type='date'
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className='w-40'
            />
            <Input
              type='date'
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className='w-40'
            />
            <Button onClick={openCreate}>
              <Plus size={16} /> 전표 등록
            </Button>
          </div>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-36'>전표번호</TableHead>
                <TableHead className='w-28'>일자</TableHead>
                <TableHead>계정과목</TableHead>
                <TableHead className='w-32 text-end'>차변</TableHead>
                <TableHead className='w-32 text-end'>대변</TableHead>
                <TableHead>적요</TableHead>
                <TableHead className='w-32'>프로젝트</TableHead>
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
                (rows ?? []).map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className='font-medium'>{v.code}</TableCell>
                    <TableCell>{v.voucherDate}</TableCell>
                    <TableCell>{v.account}</TableCell>
                    <TableCell className='text-end'>{won(v.debit)}</TableCell>
                    <TableCell className='text-end'>{won(v.credit)}</TableCell>
                    <TableCell>{v.description ?? '-'}</TableCell>
                    <TableCell>{v.projectName ?? '-'}</TableCell>
                    <TableCell className='text-end'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => openEdit(v)}
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => onDelete(v)}
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
            <SheetTitle>{editId ? '전표 수정' : '전표 등록'}</SheetTitle>
          </SheetHeader>
          <div className='flex-1 space-y-4 overflow-y-auto px-4'>
            <Field label='전표 일자'>
              <Input
                type='date'
                value={form.voucherDate}
                onChange={(e) => set('voucherDate', e.target.value)}
              />
            </Field>
            <Field label='계정과목'>
              <Input
                value={form.account}
                onChange={(e) => set('account', e.target.value)}
                placeholder='예: 매출채권'
              />
            </Field>
            <Field label='차변'>
              <Input
                type='number'
                value={form.debit ?? 0}
                onChange={(e) => set('debit', Number(e.target.value))}
              />
            </Field>
            <Field label='대변'>
              <Input
                type='number'
                value={form.credit ?? 0}
                onChange={(e) => set('credit', Number(e.target.value))}
              />
            </Field>
            <Field label='적요'>
              <Input
                value={form.description ?? ''}
                onChange={(e) => set('description', e.target.value)}
              />
            </Field>
            <Field label='프로젝트 (선택)'>
              <SelectDropdown
                defaultValue={form.projectId ? String(form.projectId) : ''}
                onValueChange={(v) => set('projectId', v ? Number(v) : null)}
                placeholder='프로젝트 선택(선택)'
                items={projectItems}
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
