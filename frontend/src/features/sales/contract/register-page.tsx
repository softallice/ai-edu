import { useState } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
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
import { useEmployees } from '@/features/hr/api'
import { useProjects } from '@/features/pm/activity/api'
import {
  useContracts,
  useSaveContract,
  useDeleteContract,
  fetchContract,
  CONTRACT_STATES,
  won,
  type ContractState,
  type ContractInput,
  type ContractLineInput,
  type ContractSummary,
} from './api'

const EMPTY: ContractInput = {
  name: '',
  customerId: 0,
  projectId: null,
  ownerId: null,
  state: 'DRAFT',
  contractDate: '',
  startDate: '',
  endDate: '',
  currency: 'KRW',
  note: '',
  active: true,
  lines: [],
}
const STATE_ITEMS = (
  Object.entries(CONTRACT_STATES) as [ContractState, string][]
).map(([value, label]) => ({ label, value }))

export function ContractRegisterPage() {
  const [keyword, setKeyword] = useState('')
  const [stateFilter, setStateFilter] = useState<ContractState | undefined>(
    undefined
  )
  const { data: contracts, isLoading } = useContracts(
    keyword || undefined,
    stateFilter
  )
  const { data: customers } = useCustomers()
  const { data: projects } = useProjects()
  const { data: employees } = useEmployees()
  const save = useSaveContract()
  const remove = useDeleteContract()

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | undefined>(undefined)
  const [form, setForm] = useState<ContractInput>(EMPTY)

  const custItems = (customers ?? []).map((c) => ({
    label: `${c.name} (${c.code})`,
    value: String(c.id),
  }))
  const projItems = (projects ?? []).map((p) => ({
    label: p.name,
    value: String(p.id),
  }))
  const empItems = (employees ?? []).map((e) => ({
    label: e.name,
    value: String(e.id),
  }))
  const set = (k: keyof ContractInput, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }))

  const setLine = (i: number, k: keyof ContractLineInput, v: unknown) =>
    setForm((f) => ({
      ...f,
      lines: f.lines.map((ln, idx) => (idx === i ? { ...ln, [k]: v } : ln)),
    }))
  const addLine = () =>
    setForm((f) => ({
      ...f,
      lines: [
        ...f.lines,
        { itemName: '', spec: '', quantity: 1, unitPrice: 0, remark: '' },
      ],
    }))
  const removeLine = (i: number) =>
    setForm((f) => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }))
  const formTotal = form.lines.reduce(
    (s, l) => s + (Number(l.quantity) || 0) * (Number(l.unitPrice) || 0),
    0
  )

  const openCreate = () => {
    setEditId(undefined)
    setForm({ ...EMPTY, customerId: customers?.[0]?.id ?? 0 })
    setOpen(true)
  }
  const openEdit = async (c: ContractSummary) => {
    const d = await fetchContract(c.id)
    setEditId(d.id)
    setForm({
      name: d.name,
      customerId: d.customerId,
      projectId: d.projectId,
      ownerId: d.ownerId,
      state: d.state,
      contractDate: d.contractDate ?? '',
      startDate: d.startDate ?? '',
      endDate: d.endDate ?? '',
      currency: d.currency,
      note: d.note ?? '',
      active: d.active,
      lines: d.lines.map((l) => ({
        itemName: l.itemName,
        spec: l.spec ?? '',
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        remark: l.remark ?? '',
      })),
    })
    setOpen(true)
  }
  const submit = () => {
    if (!form.name.trim() || !form.customerId) {
      toast.error('계약명과 거래처는 필수입니다.')
      return
    }
    const body: ContractInput = {
      ...form,
      contractDate: form.contractDate || null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      lines: form.lines.filter((l) => l.itemName.trim()),
    }
    save.mutate(
      { id: editId, body },
      {
        onSuccess: () => {
          toast.success(
            editId ? '계약을 수정했습니다.' : '계약을 등록했습니다.'
          )
          setOpen(false)
        },
        onError: () => toast.error('저장에 실패했습니다.'),
      }
    )
  }
  const onDelete = (c: ContractSummary) => {
    if (!confirm(`계약 [${c.name}]을(를) 삭제하시겠습니까?`)) return
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
            <h2 className='text-2xl font-bold tracking-tight'>계약내역 등록</h2>
            <p className='text-muted-foreground'>
              02.영업 / 계약관리 (koerp contract 이관)
            </p>
          </div>
          <div className='flex items-end gap-2'>
            <SelectDropdown
              defaultValue='ALL'
              onValueChange={(v) =>
                setStateFilter(v === 'ALL' ? undefined : (v as ContractState))
              }
              placeholder='상태'
              items={[{ label: '전체', value: 'ALL' }, ...STATE_ITEMS]}
              className='w-28'
            />
            <Input
              placeholder='계약명·번호 검색'
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className='w-48'
            />
            <Button onClick={openCreate}>
              <Plus size={16} /> 계약 등록
            </Button>
          </div>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-32'>계약번호</TableHead>
                <TableHead>계약명</TableHead>
                <TableHead>거래처</TableHead>
                <TableHead className='w-20'>상태</TableHead>
                <TableHead className='w-28'>체결일</TableHead>
                <TableHead className='w-36 text-end'>계약금액</TableHead>
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
              ) : (contracts ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className='h-24 text-center'>
                    결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                (contracts ?? []).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className='font-medium'>{c.code}</TableCell>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.customerName}</TableCell>
                    <TableCell>
                      <Badge variant='outline'>
                        {CONTRACT_STATES[c.state]}
                      </Badge>
                    </TableCell>
                    <TableCell>{c.contractDate ?? '-'}</TableCell>
                    <TableCell className='text-end'>
                      {won(c.totalAmount)}
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
        <SheetContent className='flex w-full flex-col sm:max-w-2xl'>
          <SheetHeader>
            <SheetTitle>{editId ? '계약 수정' : '계약 등록'}</SheetTitle>
          </SheetHeader>
          <div className='flex-1 space-y-4 overflow-y-auto px-4'>
            <div className='grid grid-cols-2 gap-3'>
              <Field label='계약명' className='col-span-2'>
                <Input
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                />
              </Field>
              <Field label='거래처'>
                <SelectDropdown
                  defaultValue={form.customerId ? String(form.customerId) : ''}
                  onValueChange={(v) => set('customerId', v ? Number(v) : 0)}
                  placeholder='거래처 선택'
                  items={custItems}
                />
              </Field>
              <Field label='상태'>
                <SelectDropdown
                  defaultValue={form.state}
                  onValueChange={(v) => set('state', v)}
                  placeholder='상태'
                  items={STATE_ITEMS}
                />
              </Field>
              <Field label='프로젝트'>
                <SelectDropdown
                  defaultValue={form.projectId ? String(form.projectId) : ''}
                  onValueChange={(v) => set('projectId', v ? Number(v) : null)}
                  placeholder='연결 프로젝트(선택)'
                  items={projItems}
                />
              </Field>
              <Field label='영업담당'>
                <SelectDropdown
                  defaultValue={form.ownerId ? String(form.ownerId) : ''}
                  onValueChange={(v) => set('ownerId', v ? Number(v) : null)}
                  placeholder='담당자(선택)'
                  items={empItems}
                />
              </Field>
              <Field label='체결일'>
                <Input
                  type='date'
                  value={form.contractDate ?? ''}
                  onChange={(e) => set('contractDate', e.target.value)}
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
              <Field label='비고' className='col-span-2'>
                <Input
                  value={form.note ?? ''}
                  onChange={(e) => set('note', e.target.value)}
                />
              </Field>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>계약 품목</span>
                <Button variant='outline' size='sm' onClick={addLine}>
                  <Plus size={14} /> 품목 추가
                </Button>
              </div>
              <div className='overflow-hidden rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>품목명</TableHead>
                      <TableHead className='w-24'>규격</TableHead>
                      <TableHead className='w-20'>수량</TableHead>
                      <TableHead className='w-28'>단가</TableHead>
                      <TableHead className='w-32 text-end'>금액</TableHead>
                      <TableHead className='w-10' />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {form.lines.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className='h-16 text-center text-muted-foreground'
                        >
                          품목을 추가하세요.
                        </TableCell>
                      </TableRow>
                    ) : (
                      form.lines.map((l, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Input
                              value={l.itemName}
                              onChange={(e) =>
                                setLine(i, 'itemName', e.target.value)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={l.spec ?? ''}
                              onChange={(e) =>
                                setLine(i, 'spec', e.target.value)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type='number'
                              value={l.quantity}
                              onChange={(e) =>
                                setLine(i, 'quantity', Number(e.target.value))
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type='number'
                              value={l.unitPrice}
                              onChange={(e) =>
                                setLine(i, 'unitPrice', Number(e.target.value))
                              }
                            />
                          </TableCell>
                          <TableCell className='text-end'>
                            {won(
                              (Number(l.quantity) || 0) *
                                (Number(l.unitPrice) || 0)
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => removeLine(i)}
                            >
                              <X size={14} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className='text-end text-sm'>
                계약금액 합계 <b>{won(formTotal)}</b> 원
              </div>
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
  className,
  children,
}: {
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`space-y-1 ${className ?? ''}`}>
      <label className='text-sm font-medium'>{label}</label>
      {children}
    </div>
  )
}
