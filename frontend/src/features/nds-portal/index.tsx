import { useNavigate } from '@tanstack/react-router'
import {
  TrendingUp,
  NotebookPen,
  Network,
  Clock,
  CalendarClock,
  Plane,
  Timer,
  Receipt,
  BarChart3,
  FileText,
  Calculator,
  type LucideIcon,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useCustomers } from '@/features/customers/api'

// 상단 모듈 메뉴 (레거시 NDS ERP 상단 가로 메뉴 대응)
const moduleNav = [
  { title: '프로젝트관리', href: '/', isActive: true, disabled: false },
  { title: '영업', href: '/', isActive: false, disabled: true },
  { title: '구매', href: '/customers', isActive: false, disabled: false },
  { title: '재무', href: '/', isActive: false, disabled: true },
  { title: '인사', href: '/', isActive: false, disabled: true },
  { title: '평가', href: '/', isActive: false, disabled: true },
  { title: '총무', href: '/', isActive: false, disabled: true },
  { title: '공통', href: '/', isActive: false, disabled: true },
]

// 퀵 메뉴 타일 (레거시 comMainNDS 퀵메뉴 대응)
type QuickItem = { label: string; icon: LucideIcon; to?: string }
const quickItems: QuickItem[] = [
  { label: '업무일지', icon: NotebookPen },
  { label: '조직도', icon: Network },
  { label: '출퇴근현황', icon: Clock },
  { label: '활동시간표', icon: CalendarClock },
  { label: '거래처등록', icon: FileText, to: '/customers' },
  { label: '연장근로신청', icon: Timer },
  { label: '급여명세표', icon: Receipt },
  { label: '성과실적', icon: BarChart3 },
  { label: '휴가계신청', icon: Plane },
  { label: '연말정산', icon: Calculator },
]

const schedule = [
  { date: '06월 03일 (수)', name: '지방선거' },
  { date: '06월 06일 (토)', name: '현충일' },
  { date: '06월 19일 (금)', name: '가정의 날 단체반차' },
]

const notices = [
  { no: 7, title: '연말정산 자료입력 안내 매뉴얼', writer: '정한균', date: '2023-02-02' },
  { no: 6, title: '직무성과급인사제도(PMS) 매뉴얼 V1.0', writer: '남택윤', date: '2022-11-29' },
  { no: 5, title: '크롬/엣지브라우저 외부 로그인 비정상 해결', writer: '김남호', date: '2022-08-11' },
  { no: 3, title: 'NDS PC 셋팅 안내', writer: '김남호', date: '2022-05-24' },
  { no: 2, title: 'NEBIS 시스템 안내 (경영지원본부, 서무직 해당)', writer: '김남호', date: '2022-05-24' },
  { no: 1, title: 'NDSERP 시스템 오픈', writer: '김남호', date: '2022-05-24' },
]

// 2026년 6월 달력 (1일 = 월요일)
const JUNE_FIRST_DOW = 1
const JUNE_DAYS = 30
const DOW = ['일', '월', '화', '수', '목', '금', '토']

export function NdsPortal() {
  const navigate = useNavigate()
  const { auth } = useAuthStore()
  const { data: customers } = useCustomers()

  const userName = auth.user?.email?.split('@')[0] ?? '사용자'
  const custCount = customers?.length ?? 0

  const calendarCells: (number | null)[] = [
    ...Array.from({ length: JUNE_FIRST_DOW }, () => null),
    ...Array.from({ length: JUNE_DAYS }, (_, i) => i + 1),
  ]

  return (
    <>
      <Header>
        <TopNav links={moduleNav} className='me-auto' />
        <Search />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-col gap-4'>
        {/* 상단: 프로필 + NDS VISION */}
        <div className='grid gap-4 lg:grid-cols-3'>
          {/* 프로필 카드 */}
          <Card className='border-amber-200/70'>
            <CardContent className='flex flex-col gap-4 pt-6'>
              <div className='flex items-center gap-4'>
                <Avatar className='size-16 rounded-md bg-amber-300'>
                  <AvatarFallback className='rounded-md bg-amber-300 text-xl font-bold text-amber-900'>
                    {userName.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className='space-y-1'>
                  <p className='text-lg font-bold'>{userName}님</p>
                  <p className='text-sm text-muted-foreground'>플랫폼개발실</p>
                  <Badge className='bg-amber-100 text-amber-800 hover:bg-amber-100'>
                    휴가현황보기
                  </Badge>
                </div>
              </div>
              <Separator />
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>연차휴가</span>
                  <span className='font-medium'>2일 / 22일</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>휴일보상휴가</span>
                  <span className='font-medium'>0일 / 0일</span>
                </div>
              </div>
              <Button className='w-full bg-amber-400 text-amber-950 hover:bg-amber-500'>
                개인정보상세보기
              </Button>
            </CardContent>
          </Card>

          {/* NDS VISION 배너 */}
          <Card className='relative overflow-hidden border-amber-200/70 bg-amber-50 lg:col-span-2 dark:bg-amber-950/20'>
            <CardContent className='flex h-full flex-col justify-center gap-3 py-8'>
              <p className='text-sm font-bold tracking-wide text-amber-700'>
                NDS VISION
              </p>
              <h2 className='max-w-xl text-2xl font-bold tracking-tight sm:text-3xl'>
                Cloud 혁신으로 Data가 지배하는 미래를 함께 연다.
              </h2>
              <p className='text-muted-foreground'>
                고객의 사업적 고민을 데이터 중심의 업무 혁신으로 해결합니다.
              </p>
              <TrendingUp className='pointer-events-none absolute end-6 bottom-4 size-28 text-amber-300/70' />
            </CardContent>
          </Card>
        </div>

        {/* 퀵 메뉴 */}
        <Card>
          <CardContent className='grid grid-cols-3 gap-2 py-5 sm:grid-cols-5 lg:grid-cols-10'>
            {quickItems.map((item) => (
              <button
                key={item.label}
                type='button'
                onClick={() => item.to && navigate({ to: item.to })}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-md p-2 text-center transition-colors',
                  item.to
                    ? 'cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-950/30'
                    : 'cursor-default'
                )}
              >
                <item.icon className='size-7 text-amber-500' />
                <span className='text-xs text-foreground/80'>{item.label}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* 나의메뉴 바 */}
        <div className='rounded-md bg-slate-600 px-4 py-2 text-sm font-semibold text-white'>
          ≡ 나의메뉴
        </div>

        {/* 하단: 캘린더 / 일정 / 시스템 안내 */}
        <div className='grid gap-4 lg:grid-cols-3'>
          {/* 캘린더 */}
          <Card>
            <CardHeader className='items-center pb-2'>
              <CardTitle className='text-base'>2026.06</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-7 gap-y-2 text-center text-sm'>
                {DOW.map((d, i) => (
                  <span
                    key={d}
                    className={cn(
                      'font-medium',
                      i === 0 && 'text-red-500',
                      i === 6 && 'text-blue-500'
                    )}
                  >
                    {d}
                  </span>
                ))}
                {calendarCells.map((day, i) => (
                  <span
                    key={i}
                    className={cn(
                      'py-1',
                      day && i % 7 === 0 && 'text-red-500',
                      day && i % 7 === 6 && 'text-blue-500',
                      day === 29 &&
                        'mx-auto flex size-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700'
                    )}
                  >
                    {day ?? ''}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 일정 */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base'>일정</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {schedule.map((s) => (
                <div key={s.date} className='flex gap-3 text-sm'>
                  <span className='w-28 shrink-0 text-blue-600'>{s.date}</span>
                  <span className='text-foreground/90'>{s.name}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 시스템 안내 */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base'>시스템 안내</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2.5'>
              {notices.map((n) => (
                <div key={n.no} className='flex items-center gap-2 text-sm'>
                  <span className='w-4 shrink-0 text-muted-foreground'>{n.no}</span>
                  <span className='flex-1 truncate'>{n.title}</span>
                  <span className='shrink-0 text-xs text-muted-foreground'>
                    {n.writer}
                  </span>
                  <span className='hidden shrink-0 text-xs text-muted-foreground sm:inline'>
                    {n.date}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <p className='text-center text-xs text-muted-foreground'>
          거래처 {custCount}건 · NDS ERP 메인 (React 이관) — 퀵메뉴 [거래처등록]에서 실제 화면으로 이동합니다.
        </p>
      </Main>
    </>
  )
}
