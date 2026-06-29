import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
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
  useJournals,
  useJournalEntries,
  useSaveJournalEntry,
  useDeleteJournalEntry,
  won,
  type JournalEntry,
  type JournalEntryInput,
} from './api'

const pad = (n: number) => String(n).padStart(2, '0')
const ymd = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

type LineForm = {
  accountCode: string
  name: string
  debit: number
  credit: number
}

const EMPTY_LINE: LineForm = { accountCode: '', name: '', debit: 0, credit: 0 }

const EMPTY_HEADER = {
  journalCode: '',
  ref: '',
  date: ymd(new Date()),
}

export function JournalEntriesPage() {
  const now = new Date()
  const [keyword, setKeyword] = useState('')
  const [journalCodeFilter, setJournalCodeFilter] = useState('')
  const [dateFrom, setDateFrom] = useState(
    ymd(new Date(now.getFullYear(), now.getMonth(), 1))
  )
  const [dateTo, setDateTo] = useState(
    ymd(new Date(now.getFullYear(), now.getMonth() + 1, 0))
  )

  const { data: rows, isLoading } = useJournalEntries({
    keyword: keyword || undefined,
    journalCode: journalCodeFilter || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  })
  const { data: accounts } = useAccounts()
  const { data: journals } = useJournals()
  const save = useSaveJournalEntry()
  const remove = useDeleteJournalEntry()

  const [open, setOpen] = useState(false)
  const [header, setHeader] = useState(EMPTY_HEADER)
  const [lines, setLines] = useState<LineForm[]>([{ ...EMPTY_LINE }])

  const accountOptions = (accounts ?? []).map((a) => ({
    label: `${a.code} ${a.name}`,
    value: a.code,
  }))

  const journalOptions = (journals ?? []).map((j) => ({
    label: `${j.code} ${j.name}`,
    value: j.code,
  }))

  const journalFilterOptions = [
    { label: '장부 전체', value: '' },
    ...journalOptions,
  ]

  const setH = (k: keyof typeof EMPTY_HEADER, v: string) =>
    setHeader((h) => ({ ...h, [k]: v }))

  const setLine = (i: number, k: keyof LineForm, v: string | number) =>
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)))

  const addLine = () => setLines((ls) => [...ls, { ...EMPTY_LINE }])

  const removeLine = (i: number) =>
    setLines((ls) => ls.filter((_, idx) => idx !== i))

  const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0)
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0)
  const balanced = Math.round(totalDebit) === Math.round(totalCredit)

  const openCreate = () => {
    setHeader({ ...EMPTY_HEADER, date: ymd(new Date()) })
    setLines([{ ...EMPTY_LINE }])
    setOpen(true)
  }

  const submit = () => {
    if (!header.date) {
      toast.error('일자는 필수입니다.')
      return
    }
    if (lines.length === 0) {
      toast.error('분개 라인을 하나 이상 입력하세요.')
      return
    }
    if (!balanced) {
      toast.error('차변합과 대변합이 일치하지 않습니다.')
      return
    }
    const body: JournalEntryInput = {
      journalCode: header.journalCode || undefined,
      ref: header.ref || undefined,
      date: header.date,
      lines: lines.map((l) => ({
        accountCode: l.accountCode,
        name: l.name,
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
      })),
    }
    save.mutate(body, {
      onSuccess: () => {
        toast.success('분개전표를 등록했습니다.')
        setOpen(false)
      },
      onError: () => toast.error('저장에 실패했습니다.'),
    })
  }

  const onDelete = (e: JournalEntry) => {
    if (!confirm(`전표 [${e.name}]을(를) 삭제하시겠습니까?`)) return
    remove.mutate(e.id, {
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
            <h2 className='text-2xl font-bold tracking-tight'>분개전표</h2>
            <p className='text-muted-foreground'>04.재무 / 회계 / 분개전표</p>
          </div>
          <div className='flex flex-wrap items-end gap-2'>
            <Input
              placeholder='전표번호·적요 검색'
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className='w-48'
            />
            <SelectDropdown
              defaultValue={journalCodeFilter}
              onValueChange={setJournalCodeFilter}
              placeholder='장부 전체'
              items={journalFilterOptions}
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
                <TableHead className='w-28'>장부</TableHead>
                <TableHead>적요</TableHead>
                <TableHead className='w-32 text-end'>차변합</TableHead>
                <TableHead className='w-32 text-end'>대변합</TableHead>
                <TableHead className='w-20 text-center'>균형</TableHead>
                <TableHead className='w-16 text-end'>관리</TableHead>
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
                (rows ?? []).map((e) => {
                  const bal =
                    Math.round(e.totalDebit) === Math.round(e.totalCredit)
                  return (
                    <TableRow key={e.id}>
                      <TableCell className='font-medium'>{e.name}</TableCell>
                      <TableCell>{e.entryDate}</TableCell>
                      <TableCell>{e.journalCode ?? '-'}</TableCell>
                      <TableCell>{e.ref ?? '-'}</TableCell>
                      <TableCell className='text-end'>{won(e.totalDebit)}</TableCell>
                      <TableCell className='text-end'>{won(e.totalCredit)}</TableCell>
                      <TableCell className='text-center'>
                        <Badge variant={bal ? 'default' : 'destructive'}>
                          {bal ? '균형' : '불균형'}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-end'>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => onDelete(e)}
                        >
                          <Trash2 size={15} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Main>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className='flex w-full max-w-3xl flex-col sm:max-w-3xl'>
          <SheetHeader>
            <SheetTitle>분개전표 등록</SheetTitle>
          </SheetHeader>

          <div className='flex-1 space-y-6 overflow-y-auto px-4'>
            {/* Header fields */}
            <div className='grid grid-cols-3 gap-3'>
              <Field label='장부'>
                <SelectDropdown
                  defaultValue={header.journalCode}
                  onValueChange={(v) => setH('journalCode', v)}
                  placeholder='장부 선택(선택)'
                  items={journalOptions}
                />
              </Field>
              <Field label='일자'>
                <Input
                  type='date'
                  value={header.date}
                  onChange={(e) => setH('date', e.target.value)}
                />
              </Field>
              <Field label='적요(참조)'>
                <Input
                  value={header.ref}
                  onChange={(e) => setH('ref', e.target.value)}
                  placeholder='참조 메모'
                />
              </Field>
            </div>

            {/* Line editor */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>분개 라인</span>
                <Button variant='outline' size='sm' onClick={addLine}>
                  <Plus size={14} /> 라인 추가
                </Button>
              </div>

              <div className='overflow-hidden rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>계정과목</TableHead>
                      <TableHead>적요</TableHead>
                      <TableHead className='w-28 text-end'>차변</TableHead>
                      <TableHead className='w-28 text-end'>대변</TableHead>
                      <TableHead className='w-10' />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((l, i) => (
                      <TableRow key={i}>
                        <TableCell className='p-1'>
                          <SelectDropdown
                            defaultValue={l.accountCode}
                            onValueChange={(v) => setLine(i, 'accountCode', v)}
                            placeholder='계정 선택'
                            items={accountOptions}
                          />
                        </TableCell>
                        <TableCell className='p-1'>
                          <Input
                            value={l.name}
                            onChange={(e) => setLine(i, 'name', e.target.value)}
                            placeholder='적요'
                          />
                        </TableCell>
                        <TableCell className='p-1'>
                          <Input
                            type='number'
                            value={l.debit || ''}
                            onChange={(e) =>
                              setLine(i, 'debit', Number(e.target.value))
                            }
                            className='text-end'
                            placeholder='0'
                          />
                        </TableCell>
                        <TableCell className='p-1'>
                          <Input
                            type='number'
                            value={l.credit || ''}
                            onChange={(e) =>
                              setLine(i, 'credit', Number(e.target.value))
                            }
                            className='text-end'
                            placeholder='0'
                          />
                        </TableCell>
                        <TableCell className='p-1 text-center'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => removeLine(i)}
                            disabled={lines.length === 1}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Totals */}
              <div className='flex items-center justify-end gap-4 rounded-md border px-4 py-2'>
                <span className='text-sm text-muted-foreground'>
                  차변합: <span className='font-medium text-foreground'>{won(totalDebit)}</span>
                </span>
                <span className='text-sm text-muted-foreground'>
                  대변합: <span className='font-medium text-foreground'>{won(totalCredit)}</span>
                </span>
                <Badge variant={balanced ? 'default' : 'destructive'}>
                  {balanced ? '균형' : '불균형'}
                </Badge>
              </div>
            </div>
          </div>

          <SheetFooter className='gap-2'>
            <SheetClose asChild>
              <Button variant='outline'>닫기</Button>
            </SheetClose>
            <Button
              onClick={submit}
              disabled={save.isPending || !balanced || lines.length === 0}
            >
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
