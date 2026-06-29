import {
  LayoutDashboard,
  ListChecks,
  Target,
  ShoppingCart,
  FileText,
  RefreshCw,
  PackageCheck,
  Building2,
  FolderKanban,
  Timer,
  LifeBuoy,
  Truck,
  CalendarDays,
  CalendarClock,
  Receipt,
  Wallet,
  FolderOpen,
  PenLine,
  TrendingUp,
  BarChart3,
  Users,
  ClipboardCheck,
  Plane,
  Stamp,
  ShoppingBag,
  Warehouse,
  Factory,
  GitBranch,
  Wrench,
  ShieldCheck,
  Share2,
  Mail,
  MessageSquare,
  Ticket,
  Workflow,
  UserCog,
  Settings,
  Command,
  GalleryVerticalEnd,
  AudioWaveform,
} from 'lucide-react'
import { type SidebarData } from '../types'

// koerp(AWS MSP 한국형 ERP) 메뉴 구조를 우리 시스템에 맞게 구성.
// 구현된 화면(고객→/customers, 사용자→/users, 대시보드→/)은 실제 라우트로,
// 그 외 모듈은 캐치올 라우트(_authenticated/$)에서 "준비중"으로 표시됩니다.
export const sidebarData: SidebarData = {
  user: {
    name: 'admin',
    email: 'admin@aiedu.local',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    { name: 'koerp', logo: Command, plan: 'AWS MSP ERP' },
    { name: 'ai-edu', logo: GalleryVerticalEnd, plan: 'Education' },
    { name: 'NDS', logo: AudioWaveform, plan: 'Enterprise' },
  ],
  navGroups: [
    {
      title: '일반',
      items: [
        { title: '대시보드', url: '/', icon: LayoutDashboard },
        { title: '내 활동', url: '/activities', icon: ListChecks },
      ],
    },
    {
      title: '판매 관리',
      items: [
        {
          title: 'CRM',
          icon: Target,
          items: [
            { title: '파이프라인', url: '/crm/pipeline' },
            { title: '영업기회', url: '/crm/opportunities' },
            { title: '리드', url: '/crm/leads' },
            { title: '분석', url: '/crm/report' },
            { title: '설정', url: '/crm/config' },
          ],
        },
        { title: '판매', url: '/sales', icon: ShoppingCart },
        { title: '관리계약(MSA)', url: '/contracts', icon: FileText },
        { title: '구독', url: '/subscription', icon: RefreshCw },
        { title: '렌탈', url: '/rental', icon: PackageCheck },
        { title: '고객(거래처)', url: '/customers', icon: Building2 },
      ],
    },
    {
      title: '서비스 관리',
      items: [
        {
          title: '프로젝트',
          icon: FolderKanban,
          items: [
            { title: '업무 보드', url: '/project/board' },
            { title: '내 칸반', url: '/project/personal' },
            { title: '현황·평점', url: '/project/updates' },
            { title: '진척 대시보드', url: '/project/dashboard' },
            { title: '이익율', url: '/project/profitability' },
            { title: '리포트', url: '/project/report' },
            { title: '설정', url: '/project/config' },
          ],
        },
        {
          title: '작업기록',
          icon: Timer,
          items: [
            { title: '작업기록', url: '/timesheet/entries' },
            { title: '승인 대기', url: '/timesheet/validate' },
            { title: '리포트', url: '/timesheet/report' },
            { title: '설정', url: '/timesheet/config' },
          ],
        },
        {
          title: '헬프데스크',
          icon: LifeBuoy,
          items: [
            { title: '개요', url: '/helpdesk/overview' },
            { title: '티켓', url: '/helpdesk/tickets' },
            { title: '리포트', url: '/helpdesk/report' },
            { title: '설정', url: '/helpdesk/config' },
          ],
        },
        {
          title: '현장서비스',
          icon: Truck,
          items: [
            { title: '내 작업', url: '/field-service/mine' },
            { title: '전체 작업', url: '/field-service/all' },
            { title: '일정 계획', url: '/field-service/planning' },
            { title: '리포트', url: '/field-service/report' },
            { title: '설정', url: '/field-service/config' },
          ],
        },
        {
          title: '일정관리',
          icon: CalendarDays,
          items: [
            { title: '근무 일정', url: '/planning/schedule' },
            { title: '내 일정', url: '/planning/my' },
            { title: '리포트', url: '/planning/report' },
            { title: '설정', url: '/planning/config' },
          ],
        },
        { title: '일정예약', url: '/appointments', icon: CalendarClock },
      ],
    },
    {
      title: '재무',
      items: [
        {
          title: '회계',
          icon: Receipt,
          items: [
            { title: '대시보드', url: '/invoice/dashboard' },
            { title: '전표', url: '/invoice/journal' },
            { title: '시산표', url: '/invoice/trial' },
            { title: '재무제표', url: '/invoice/fin' },
            { title: '부가세', url: '/invoice/vat' },
            { title: '연령분석', url: '/invoice/aged' },
            { title: '채권관리', url: '/dunning' },
            { title: '관리회계', url: '/invoice/analytic' },
            { title: 'AWS 펀딩', url: '/funding' },
            { title: '타 CSP 정산', url: '/csp-settlement' },
            { title: '설정', url: '/invoice/config' },
          ],
        },
        {
          title: '청구서 관리',
          icon: FileText,
          items: [
            { title: '매출', url: '/invoice/customer' },
            { title: '매입', url: '/invoice/vendor' },
            { title: '결제(PG)', url: '/payment' },
          ],
        },
        {
          title: '비용관리',
          icon: Wallet,
          items: [
            { title: '내 비용', url: '/expense/mine' },
            { title: '비용 보고서', url: '/expense/reports' },
            { title: '분석', url: '/expense/analysis' },
            { title: '설정', url: '/expense/config' },
          ],
        },
        { title: '문서', url: '/documents', icon: FolderOpen },
        { title: '전자서명', url: '/sign', icon: PenLine },
      ],
    },
    {
      title: '경영 분석',
      items: [
        { title: '목표 대비 실적', url: '/sales-plan', icon: Target },
        { title: '수익성 분석', url: '/analytics/profitability', icon: TrendingUp },
        { title: '팀 성과', url: '/analytics/team-performance', icon: BarChart3 },
        { title: '고객 비용 대시보드', url: '/customer-cost', icon: Building2 },
      ],
    },
    {
      title: '조직',
      items: [
        {
          title: '인사',
          icon: Users,
          items: [
            { title: '직원', url: '/hr/employees' },
            { title: '부서', url: '/hr/departments' },
            { title: '보고', url: '/hr/report' },
            { title: '설정', url: '/hr/config' },
          ],
        },
        {
          title: '인사평가',
          icon: ClipboardCheck,
          items: [
            { title: '평가', url: '/hr/appraisals/list' },
            { title: '목표', url: '/hr/appraisals/goals' },
            { title: '리포트', url: '/hr/appraisals/report' },
            { title: '설정', url: '/hr/appraisals/config' },
          ],
        },
        {
          title: '휴가 관리',
          icon: Plane,
          items: [
            { title: '내 휴가', url: '/hr/leaves/mine' },
            { title: '현황', url: '/hr/leaves/overview' },
            { title: '관리', url: '/hr/leaves/manage' },
            { title: '리포트', url: '/hr/leaves/report' },
            { title: '설정', url: '/hr/leaves/config' },
          ],
        },
        { title: '전자결재', url: '/approval', icon: Stamp },
      ],
    },
    {
      title: '공급망',
      items: [
        {
          title: '매입관리',
          icon: ShoppingBag,
          items: [
            { title: '발주서', url: '/purchase/orders' },
            { title: '구매요청', url: '/purchase/requests' },
            { title: '제품', url: '/purchase/products' },
            { title: '리포트', url: '/purchase/report' },
            { title: '설정', url: '/purchase/config' },
          ],
        },
        {
          title: '재고 관리',
          icon: Warehouse,
          items: [
            { title: '개요', url: '/stock/overview' },
            { title: '입출고', url: '/stock/operations' },
            { title: '제품', url: '/stock/products' },
            { title: '리포트', url: '/stock/report' },
            { title: '설정', url: '/stock/config' },
          ],
        },
        { title: '제조 관리', url: '/mrp', icon: Factory },
        { title: '제품 수명주기(PLM)', url: '/plm', icon: GitBranch },
        { title: '유지 관리', url: '/maintenance', icon: Wrench },
        { title: '품질', url: '/quality', icon: ShieldCheck },
      ],
    },
    {
      title: '마케팅 관리',
      items: [
        { title: '소셜 마케팅', url: '/social', icon: Share2 },
        { title: '이메일 마케팅', url: '/email-marketing', icon: Mail },
        { title: 'SMS 마케팅', url: '/sms-marketing', icon: MessageSquare },
        { title: '행사', url: '/events', icon: Ticket },
        { title: '마케팅 자동화', url: '/marketing-automation', icon: Workflow },
        { title: '설문 조사', url: '/survey', icon: ClipboardCheck },
      ],
    },
    {
      title: '시스템',
      items: [
        {
          title: '사용자 관리',
          icon: UserCog,
          items: [
            { title: '사용자', url: '/users' },
            { title: '역할/권한', url: '/settings/roles' },
            { title: '발행처 정보', url: '/settings/company' },
            { title: '모듈 설정', url: '/settings/modules' },
            { title: '자동화 스케줄러', url: '/settings/scheduler' },
          ],
        },
        { title: '설정', url: '/settings', icon: Settings },
      ],
    },
  ],
}
