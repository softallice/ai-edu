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
  Users,
  FolderKanban,
  HandCoins,
  Briefcase,
  type LucideIcon,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useDashboard, type ProjectStatusDist } from './use-dashboard'

// ─── Static data ─────────────────────────────────────────────────────────────

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

// ─── Chart configs ────────────────────────────────────────────────────────────

const trendChartConfig: ChartConfig = {
  hours: {
    label: '공수(h)',
    color: 'hsl(35 90% 45%)',
  },
  amount: {
    label: '계약금액',
    color: 'hsl(174 60% 35%)',
  },
}

const statusChartConfig: ChartConfig = {
  planned: { label: '계획', color: 'hsl(210 20% 65%)' },
  in_progress: { label: '진행중', color: 'hsl(35 90% 45%)' },
  on_hold: { label: '보류', color: 'hsl(38 90% 65%)' },
  done: { label: '완료', color: 'hsl(174 60% 35%)' },
  cancelled: { label: '취소', color: 'hsl(0 55% 60%)' },
}

const deptChartConfig: ChartConfig = {
  count: {
    label: '인원',
    color: 'hsl(35 90% 45%)',
  },
}

// ─── KPI card ─────────────────────────────────────────────────────────────────

type KpiCardProps = {
  title: string
  value: string
  sub: string
  icon: LucideIcon
  accent: string
  isLoading: boolean
}

function KpiCard({
  title,
  value,
  sub,
  icon: Icon,
  accent,
  isLoading,
}: KpiCardProps) {
  return (
    <Card className='relative overflow-hidden'>
      <CardHeader className='pb-2'>
        <CardDescription className='text-xs font-medium tracking-wide uppercase'>
          {title}
        </CardDescription>
        <CardTitle className='text-3xl font-bold tracking-tight tabular-nums'>
          {isLoading ? <Skeleton className='h-8 w-24' /> : value}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-xs text-muted-foreground'>{sub}</p>
      </CardContent>
      <div
        className='pointer-events-none absolute end-4 top-4 flex size-10 items-center justify-center rounded-lg opacity-15'
        style={{ backgroundColor: accent }}
        aria-hidden='true'
      >
        <Icon className='size-5' style={{ color: accent }} />
      </div>
      <Icon
        className='pointer-events-none absolute -end-3 -bottom-3 size-16 opacity-[0.06]'
        style={{ color: accent }}
        aria-hidden='true'
      />
    </Card>
  )
}

// ─── Status color map (matches chartConfig keys) ──────────────────────────────

const STATUS_KEY_MAP: Record<string, string> = {
  PLANNED: 'planned',
  IN_PROGRESS: 'in_progress',
  ON_HOLD: 'on_hold',
  DONE: 'done',
  CANCELLED: 'cancelled',
}

function pieColorFor(s: ProjectStatusDist) {
  const key = STATUS_KEY_MAP[s.status]
  return statusChartConfig[key]?.color ?? 'hsl(210 20% 65%)'
}

// ─── NdsPortal ────────────────────────────────────────────────────────────────

export function NdsPortal() {
  const navigate = useNavigate()
  const { auth } = useAuthStore()
  const {
    isLoading,
    kpi,
    monthlyTrend,
    projectStatus,
    deptHeadcount,
    recentContracts,
  } = useDashboard()

  const userName = auth.user?.email?.split('@')[0] ?? '사용자'
  const totalProjects = projectStatus.reduce((s, d) => s + d.count, 0)

  const wonShort = (n: number) => {
    if (n >= 1_0000_0000) return `${(n / 1_0000_0000).toFixed(1)}억`
    if (n >= 1_0000) return `${(n / 1_0000).toFixed(0)}만`
    return n.toLocaleString('ko-KR')
  }

  return (
    <>
      <Header>
        <TopNav links={moduleNav} className='me-auto' />
        <Search />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-col gap-5'>
        {/* ── 프로필 + 웰컴 배너 ─────────────────────────────────── */}
        <div className='grid gap-4 lg:grid-cols-3'>
          <Card className='border-amber-200/60 dark:border-amber-800/30'>
            <CardContent className='flex flex-col gap-4 pt-6'>
              <div className='flex items-center gap-4'>
                <Avatar className='size-14 rounded-lg bg-amber-100 dark:bg-amber-900/40'>
                  <AvatarFallback className='rounded-lg bg-amber-100 text-lg font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'>
                    {userName.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className='space-y-1'>
                  <p className='text-base leading-tight font-semibold'>
                    {userName}님
                  </p>
                  <p className='text-xs text-muted-foreground'>플랫폼개발실</p>
                  <Badge
                    variant='outline'
                    className='border-amber-300 text-[10px] text-amber-700 dark:border-amber-700 dark:text-amber-400'
                  >
                    휴가현황 보기
                  </Badge>
                </div>
              </div>
              <Separator />
              <div className='grid grid-cols-2 gap-3 text-sm'>
                <div className='rounded-md bg-muted/50 px-3 py-2'>
                  <p className='text-[10px] text-muted-foreground'>연차휴가</p>
                  <p className='mt-0.5 font-semibold tabular-nums'>
                    2{' '}
                    <span className='text-xs font-normal text-muted-foreground'>
                      / 22일
                    </span>
                  </p>
                </div>
                <div className='rounded-md bg-muted/50 px-3 py-2'>
                  <p className='text-[10px] text-muted-foreground'>보상휴가</p>
                  <p className='mt-0.5 font-semibold tabular-nums'>
                    0{' '}
                    <span className='text-xs font-normal text-muted-foreground'>
                      / 0일
                    </span>
                  </p>
                </div>
              </div>
              <Button
                size='sm'
                variant='outline'
                className='w-full border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/30'
              >
                개인정보 상세보기
              </Button>
            </CardContent>
          </Card>

          <Card className='relative overflow-hidden border-amber-200/60 bg-gradient-to-br from-amber-50 to-orange-50 lg:col-span-2 dark:border-amber-800/30 dark:from-amber-950/20 dark:to-orange-950/10'>
            <CardContent className='flex h-full flex-col justify-center gap-3 py-8'>
              <p className='text-[11px] font-bold tracking-widest text-amber-600 uppercase dark:text-amber-500'>
                NDS VISION
              </p>
              <h2
                className='max-w-xl text-xl font-bold tracking-tight sm:text-2xl'
                style={{ textWrap: 'balance' } as React.CSSProperties}
              >
                Cloud 혁신으로 Data가 지배하는 미래를 함께 연다.
              </h2>
              <p className='text-sm text-muted-foreground'>
                고객의 사업적 고민을 데이터 중심의 업무 혁신으로 해결합니다.
              </p>
            </CardContent>
            <TrendingUp
              className='pointer-events-none absolute end-6 bottom-4 size-24 text-amber-200 dark:text-amber-800/50'
              aria-hidden='true'
            />
          </Card>
        </div>

        {/* ── KPI 스탯 카드 4장 ──────────────────────────────────── */}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <KpiCard
            title='진행 중 프로젝트'
            value={String(kpi.activeProjects)}
            sub='전체 중 IN_PROGRESS 상태'
            icon={FolderKanban}
            accent='hsl(35 90% 45%)'
            isLoading={isLoading}
          />
          <KpiCard
            title='재직 인원'
            value={String(kpi.totalEmployees)}
            sub='현재 active 직원 수'
            icon={Users}
            accent='hsl(174 60% 35%)'
            isLoading={isLoading}
          />
          <KpiCard
            title='이번 달 총 공수'
            value={
              isLoading ? '—' : `${kpi.monthlyHours.toLocaleString('ko-KR')}h`
            }
            sub='이번 달 타임시트 합계'
            icon={Briefcase}
            accent='hsl(210 70% 50%)'
            isLoading={isLoading}
          />
          <KpiCard
            title='계약 총액'
            value={isLoading ? '—' : wonShort(kpi.contractTotal)}
            sub={`활성 계약 ${kpi.contractCount}건`}
            icon={HandCoins}
            accent='hsl(280 55% 50%)'
            isLoading={isLoading}
          />
        </div>

        {/* ── 메인 차트 그리드 (7col) ────────────────────────────── */}
        <div className='grid gap-4 lg:grid-cols-7'>
          {/* 월별 공수·계약 추이 Area 차트 */}
          <Card className='lg:col-span-4'>
            <CardHeader>
              <CardTitle className='text-sm font-semibold'>
                월별 공수 · 계약금액 추이
              </CardTitle>
              <CardDescription className='text-xs'>최근 6개월</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className='h-[240px] w-full' />
              ) : (
                <ChartContainer
                  config={trendChartConfig}
                  className='h-[240px] w-full'
                >
                  <AreaChart
                    data={monthlyTrend}
                    margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id='grad-hours'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'
                      >
                        <stop
                          offset='5%'
                          stopColor='hsl(35 90% 45%)'
                          stopOpacity={0.25}
                        />
                        <stop
                          offset='95%'
                          stopColor='hsl(35 90% 45%)'
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                      <linearGradient
                        id='grad-amount'
                        x1='0'
                        y1='0'
                        x2='0'
                        y2='1'
                      >
                        <stop
                          offset='5%'
                          stopColor='hsl(174 60% 35%)'
                          stopOpacity={0.2}
                        />
                        <stop
                          offset='95%'
                          stopColor='hsl(174 60% 35%)'
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray='3 3' />
                    <XAxis
                      dataKey='month'
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      yAxisId='hours'
                      orientation='left'
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10 }}
                      width={32}
                    />
                    <YAxis
                      yAxisId='amount'
                      orientation='right'
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10 }}
                      width={40}
                      tickFormatter={(v: number) =>
                        v >= 1_0000 ? `${(v / 1_0000).toFixed(0)}만` : String(v)
                      }
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent indicator='line' />}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area
                      yAxisId='hours'
                      type='monotone'
                      dataKey='hours'
                      stroke='hsl(35 90% 45%)'
                      strokeWidth={2}
                      fill='url(#grad-hours)'
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                    <Area
                      yAxisId='amount'
                      type='monotone'
                      dataKey='amount'
                      stroke='hsl(174 60% 35%)'
                      strokeWidth={2}
                      fill='url(#grad-amount)'
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* 프로젝트 상태 Donut */}
          <Card className='lg:col-span-3'>
            <CardHeader>
              <CardTitle className='text-sm font-semibold'>
                프로젝트 상태 분포
              </CardTitle>
              <CardDescription className='text-xs'>
                전체 {totalProjects}건
              </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col items-center'>
              {isLoading ? (
                <Skeleton className='h-[220px] w-full' />
              ) : projectStatus.length === 0 ? (
                <div className='flex h-[220px] items-center justify-center text-xs text-muted-foreground'>
                  데이터 없음
                </div>
              ) : (
                <ChartContainer
                  config={statusChartConfig}
                  className='h-[220px] w-full'
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={projectStatus}
                      dataKey='count'
                      nameKey='label'
                      cx='50%'
                      cy='50%'
                      innerRadius={64}
                      outerRadius={90}
                      strokeWidth={2}
                      stroke='var(--background)'
                      label={false}
                    >
                      {projectStatus.map((entry) => (
                        <Cell key={entry.status} fill={pieColorFor(entry)} />
                      ))}
                      {/* center label via recharts label prop on Pie is unreliable; use overlay */}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              )}
              {/* Legend pills */}
              {!isLoading && projectStatus.length > 0 && (
                <div className='mt-2 flex flex-wrap justify-center gap-2'>
                  {projectStatus.map((s) => (
                    <div
                      key={s.status}
                      className='flex items-center gap-1 text-[11px]'
                    >
                      <span
                        className='inline-block size-2 rounded-sm'
                        style={{ backgroundColor: pieColorFor(s) }}
                      />
                      <span className='text-muted-foreground'>{s.label}</span>
                      <span className='font-semibold tabular-nums'>
                        {s.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── 하단 그리드 (7col) ─────────────────────────────────── */}
        <div className='grid gap-4 lg:grid-cols-7'>
          {/* 부서별 인원 Bar 차트 */}
          <Card className='lg:col-span-4'>
            <CardHeader>
              <CardTitle className='text-sm font-semibold'>
                부서별 재직 인원
              </CardTitle>
              <CardDescription className='text-xs'>
                상위 6개 부서 (active 직원)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className='h-[200px] w-full' />
              ) : deptHeadcount.length === 0 ? (
                <div className='flex h-[200px] items-center justify-center text-xs text-muted-foreground'>
                  데이터 없음
                </div>
              ) : (
                <ChartContainer
                  config={deptChartConfig}
                  className='h-[200px] w-full'
                >
                  <BarChart
                    data={deptHeadcount}
                    layout='vertical'
                    margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
                  >
                    <XAxis type='number' hide />
                    <YAxis
                      type='category'
                      dataKey='dept'
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                      width={72}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent indicator='dot' />}
                    />
                    <Bar
                      dataKey='count'
                      fill='hsl(35 90% 45%)'
                      radius={[0, 4, 4, 0]}
                      maxBarSize={18}
                    />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* 최근 계약 + 퀵메뉴 + 일정 */}
          <div className='flex flex-col gap-4 lg:col-span-3'>
            {/* 최근 계약 목록 */}
            <Card className='flex-1'>
              <CardHeader>
                <CardTitle className='text-sm font-semibold'>
                  최근 계약
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-2.5'>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className='h-5 w-full' />
                  ))
                ) : recentContracts.length === 0 ? (
                  <p className='text-xs text-muted-foreground'>
                    계약 데이터 없음
                  </p>
                ) : (
                  recentContracts.map((c) => (
                    <div key={c.id} className='flex items-center gap-2 text-xs'>
                      <Badge
                        variant='outline'
                        className={cn(
                          'shrink-0 px-1.5 py-0 text-[10px]',
                          c.state === 'IN_PROGRESS' &&
                            'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400',
                          c.state === 'SIGNED' &&
                            'border-teal-300 text-teal-700 dark:border-teal-700 dark:text-teal-400',
                          c.state === 'DONE' &&
                            'border-slate-300 text-slate-500',
                          c.state === 'DRAFT' && 'border-blue-200 text-blue-600'
                        )}
                      >
                        {c.state === 'IN_PROGRESS'
                          ? '진행'
                          : c.state === 'SIGNED'
                            ? '체결'
                            : c.state === 'DONE'
                              ? '완료'
                              : c.state === 'DRAFT'
                                ? '초안'
                                : c.state}
                      </Badge>
                      <span className='flex-1 truncate text-foreground/90'>
                        {c.name}
                      </span>
                      <span className='shrink-0 text-muted-foreground tabular-nums'>
                        {c.totalAmount.toLocaleString('ko-KR')}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* 일정 */}
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-semibold'>일정</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2.5'>
                {schedule.map((s) => (
                  <div key={s.date} className='flex gap-3 text-xs'>
                    <span className='w-24 shrink-0 font-medium text-blue-600 dark:text-blue-400'>
                      {s.date}
                    </span>
                    <span className='text-foreground/90'>{s.name}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── 퀵 메뉴 ───────────────────────────────────────────── */}
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-semibold text-muted-foreground'>
              퀵 메뉴
            </CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-5 gap-1 pb-4 sm:grid-cols-10'>
            {quickItems.map((item) => (
              <button
                key={item.label}
                type='button'
                onClick={() => item.to && navigate({ to: item.to })}
                className={cn(
                  'group flex flex-col items-center gap-1.5 rounded-lg px-2 py-3 text-center transition-colors',
                  item.to
                    ? 'cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-950/30'
                    : 'cursor-default opacity-60'
                )}
              >
                <div className='flex size-9 items-center justify-center rounded-lg bg-muted/60 transition-colors group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30'>
                  <item.icon className='size-4 text-amber-600 dark:text-amber-500' />
                </div>
                <span className='text-[11px] leading-tight text-foreground/70'>
                  {item.label}
                </span>
              </button>
            ))}
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
