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
import { useCustomers } from '@/features/customers/api'
import {
  useProposals,
  useSaveProposal,
  useDeleteProposal,
  useProjects,
  PROPOSAL_STATUS,
  won,
  type Proposal,
  type ProposalInput,
  type ProposalStatus,
} from './api'

const EMPTY: ProposalInput = {
  customerId: 0,
  projectId: null,
  proposalDate: '',
  title: '',
  amount: 0,
  status: 'DRAFT',
  note: '',
}

const STATUS_ITEMS = (
  Object.entries(PROPOSAL_STATUS) as [ProposalStatus, string][]
).map(([value, label]) => ({ label, value }))

export function ProposalPage() {
  const [keyword, setKeyword] = useState('')
  const { data: rows, isLoading } = useProposals({
    keyword: keyword || undefined,
  })
  const { data: customers } = useCustomers()
  const { data: projects } = useProjects()
  const save = useSaveProposal()
  const remove = useDeleteProposal()

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | undefined>(undefined)
  const [form, setForm] = useState<ProposalInput>(EMPTY)

  const custItems = (customers ?? []).map((c) => ({
    label: `${c.name} (${c.code})`,
    value: String(c.id),
  }))
  const projectItems = (projects ?? []).map((p) => ({
    label: `${p.code} ${p.name}`,
    value: String(p.id),
  }))

  const set = (k: keyof ProposalInput, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }))

  const openCreate = () => {
    setEditId(undefined)
    setForm({ ...EMPTY, customerId: customers?.[0]?.id ?? 0 })
    setOpen(true)
  }
  const openEdit = (p: Proposal) => {
    setEditId(p.id)
    setForm({
      customerId: p.customerId,
      projectId: p.projectId,
      proposalDate: p.proposalDate ?? '',
      title: p.title,
      amount: p.amount,
      status: p.status,
      note: p.note ?? '',
    })
    setOpen(true)
  }
  const submit = () => {
    if (!form.customerId || !form.title.trim()) {
      toast.error('거래처와 제안명은 필수입니다.')
      return
    }
    save.mutate(
      {
        id: editId,
        body: {
          ...form,
          proposalDate: form.proposalDate || null,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            editId ? '제안내역을 수정했습니다.' : '제안내역을 등록했습니다.'
          )
          setOpen(false)
        },
        onError: () => toast.error('저장에 실패했습니다.'),
      }
    )
  }
  const onDelete = (p: Proposal) => {
    if (!confirm(`제안내역 [${p.code}]을(를) 삭제하시겠습니까?`)) return
    remove.mutate(p.id, {
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
            <h2 className='text-2xl font-bold tracking-tight'>제안내역</h2>
            <p className='text-muted-foreground'>
              02.영업 / 계약 — 제안내역 관리
            </p>
          </div>
          <div className='flex items-end gap-2'>
            <Input
              placeholder='제안번호·제안명 검색'
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className='w-52'
            />
            <Button onClick={openCreate}>
              <Plus size={16} /> 제안 등록
            </Button>
          </div>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-36'>제안번호</TableHead>
                <TableHead>제안명</TableHead>
                <TableHead>거래처</TableHead>
                <TableHead className='w-28'>제안일</TableHead>
                <TableHead className='w-32 text-end'>제안금액</TableHead>
                <TableHead className='w-20'>상태</TableHead>
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
                (rows ?? []).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className='font-medium'>{p.code}</TableCell>
                    <TableCell>{p.title}</TableCell>
                    <TableCell>{p.customerName}</TableCell>
                    <TableCell>{p.proposalDate ?? '-'}</TableCell>
                    <TableCell className='text-end'>{won(p.amount)}</TableCell>
                    <TableCell>
                      <Badge variant='outline'>
                        {PROPOSAL_STATUS[p.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-end'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => openEdit(p)}
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => onDelete(p)}
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
              {editId ? '제안내역 수정' : '제안내역 등록'}
            </SheetTitle>
          </SheetHeader>
          <div className='flex-1 space-y-4 overflow-y-auto px-4'>
            <Field label='거래처'>
              <SelectDropdown
                defaultValue={form.customerId ? String(form.customerId) : ''}
                onValueChange={(v) => set('customerId', v ? Number(v) : 0)}
                placeholder='거래처 선택'
                items={custItems}
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
            <Field label='제안명'>
              <Input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder='제안명을 입력하세요'
              />
            </Field>
            <Field label='제안일'>
              <Input
                type='date'
                value={form.proposalDate ?? ''}
                onChange={(e) => set('proposalDate', e.target.value)}
              />
            </Field>
            <Field label='제안금액'>
              <Input
                type='number'
                value={form.amount ?? 0}
                onChange={(e) => set('amount', Number(e.target.value))}
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
