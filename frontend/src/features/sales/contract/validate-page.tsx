import { Badge } from '@/components/ui/badge'
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
import { ThemeSwitch } from '@/components/theme-switch'
import { useContracts, CONTRACT_STATES, type ContractSummary } from './api'

type IssueKey = 'noLine' | 'zeroAmount' | 'noDate' | 'isDraft'

const ISSUE_LABELS: Record<IssueKey, string> = {
  noLine: '품목 없음',
  zeroAmount: '금액 0 이하',
  noDate: '계약일 누락',
  isDraft: '미서명(DRAFT)',
}

function detectIssues(c: ContractSummary): IssueKey[] {
  const issues: IssueKey[] = []
  if (c.lineCount === 0) issues.push('noLine')
  if (c.totalAmount <= 0) issues.push('zeroAmount')
  if (!c.contractDate) issues.push('noDate')
  if (c.state === 'DRAFT') issues.push('isDraft')
  return issues
}

export function ContractValidatePage() {
  const { data: rows, isLoading } = useContracts()
  const list = rows ?? []

  const errorRows = list.filter((c) => detectIssues(c).length > 0)

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
              계약등록오류검증
            </h2>
            <p className='text-muted-foreground'>
              02.영업 / 계약 — 등록 데이터 오류 항목 확인
            </p>
          </div>
        </div>

        <div className='flex flex-wrap gap-4 text-sm'>
          <span>
            총 계약수 <b>{list.length}</b>
          </span>
          <span>
            오류 계약수 <b className='text-destructive'>{errorRows.length}</b>
          </span>
        </div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-36'>계약번호</TableHead>
                <TableHead>계약명</TableHead>
                <TableHead>거래처</TableHead>
                <TableHead className='w-24'>상태</TableHead>
                <TableHead className='w-28'>계약일</TableHead>
                <TableHead className='w-28 text-end'>금액</TableHead>
                <TableHead>오류 항목</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className='h-24 text-center'>
                    불러오는 중…
                  </TableCell>
                </TableRow>
              ) : list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className='h-24 text-center'>
                    결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                list.map((c) => {
                  const issues = detectIssues(c)
                  return (
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
                        {(c.totalAmount ?? 0).toLocaleString('ko-KR')}
                      </TableCell>
                      <TableCell>
                        <div className='flex flex-wrap gap-1'>
                          {issues.length === 0 ? (
                            <Badge variant='outline'>정상</Badge>
                          ) : (
                            issues.map((iss) => (
                              <Badge key={iss} variant='destructive'>
                                {ISSUE_LABELS[iss]}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Main>
    </>
  )
}
