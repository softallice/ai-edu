import {
  LayoutDashboard,
  Timer,
  NotebookPen,
  Activity,
  Wallet,
  TrendingUp,
  Users,
  ClipboardCheck,
  FileText,
  ShoppingCart,
  Receipt,
  Coins,
  Building2,
  CreditCard,
  BookText,
  Network,
  CalendarClock,
  Banknote,
  BarChart3,
  GraduationCap,
  FileBadge,
  Calculator,
  PiggyBank,
  UserCheck,
  Contact,
  Target,
  ListChecks,
  Stamp,
  HandCoins,
  Building,
  Megaphone,
  Command,
  GalleryVerticalEnd,
  AudioWaveform,
} from 'lucide-react'
import { type SidebarData } from '../types'

// NDS ERP 표준 메뉴 체계(8개 모듈)를 그대로 반영한 사이드바.
// - navGroups[].title = 모듈명(01.프로젝트관리 ~ 08.공통) → 섹션 헤더
// - items = 서브그룹(활동관리 등) → 접이식, 그 하위 items = 실제 화면(말단 메뉴)
// 구현된 화면만 실제 라우트로 연결: 거래처등록→/customers, 인사정보상세→/hr/employees,
// 조직도→/hr/departments, 사용자→/users. 나머지 경로는 캐치올 라우트(_authenticated/$)에서
// "준비중(Coming soon)"으로 표시됩니다(비용이 큰 화면은 이후 단계에서 구현).
export const sidebarData: SidebarData = {
  user: {
    name: 'admin',
    email: 'admin@aiedu.local',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    { name: 'NDS ERP', logo: Command, plan: 'Enterprise' },
    { name: 'ai-edu', logo: GalleryVerticalEnd, plan: 'Education' },
    { name: 'koerp', logo: AudioWaveform, plan: 'AWS MSP ERP' },
  ],
  navGroups: [
    {
      title: '일반',
      items: [{ title: '대시보드', url: '/', icon: LayoutDashboard }],
    },
    {
      title: '01. 프로젝트관리',
      items: [
        {
          title: '활동관리',
          icon: Timer,
          items: [
            { title: '활동시간등록', url: '/pm/activity/register' },
            { title: '활동시간승인(ITO-1차승인)', url: '/pm/activity/approve-ito1' },
            { title: '활동시간승인(ITO-팀장)', url: '/pm/activity/approve-ito-lead' },
            { title: '활동시간승인(대외사업-PM/사업)', url: '/pm/activity/approve-ext-pm' },
            { title: '활동시간승인(대외사업-팀장)', url: '/pm/activity/approve-ext-lead' },
            { title: '활동시간조회', url: '/pm/activity/view' },
          ],
        },
        { title: '업무일지', url: '/pm/worklog', icon: NotebookPen },
        {
          title: '가동율관리',
          icon: Activity,
          items: [
            { title: '개인가동율조회', url: '/pm/utilization/personal' },
            { title: '가동율활동수정(부서장)', url: '/pm/utilization/edit-dept' },
            { title: '가동율활동수정(파트장)', url: '/pm/utilization/edit-part' },
          ],
        },
        {
          title: '예산관리',
          icon: Wallet,
          items: [
            { title: '팀별예산대실적', url: '/pm/budget/team-actual' },
            { title: '프로젝트예산대실적', url: '/pm/budget/project-actual' },
            { title: '프로젝트업무추진비현황', url: '/pm/budget/project-expense' },
            { title: '팀예산대프로젝트예산', url: '/pm/budget/team-vs-project' },
            { title: '예산별실적내역(공통)', url: '/pm/budget/actual-common' },
            { title: '예산별실적내역(프로젝트)', url: '/pm/budget/actual-project' },
          ],
        },
        {
          title: '실적관리',
          icon: TrendingUp,
          items: [
            { title: '프로젝트/팀별실적현황', url: '/pm/performance/by-team' },
            { title: '매출집표내역', url: '/pm/performance/sales-summary' },
            { title: '프로젝트매출/원가내역서', url: '/pm/performance/sales-cost' },
          ],
        },
        {
          title: '인력관리',
          icon: Users,
          items: [
            { title: '프로젝트당사업투입현황', url: '/pm/manpower/allocation' },
            { title: '인력원가등급조회', url: '/pm/manpower/cost-grade' },
          ],
        },
        {
          title: '수행평가',
          icon: ClipboardCheck,
          items: [
            { title: '프로젝트인력평가(PM)', url: '/pm/eval/pm' },
            { title: '프로젝트인력평가(영업팀장)', url: '/pm/eval/sales-lead' },
            { title: '프로젝트인력평가(주관팀장)', url: '/pm/eval/lead' },
            { title: '프로젝트인력평가(승인자/본부장)', url: '/pm/eval/approver' },
            { title: '프로젝트인력평가진행현황', url: '/pm/eval/progress' },
            { title: '프로젝트인력평가결과', url: '/pm/eval/result' },
            { title: '프로젝트인력평가조회', url: '/pm/eval/view' },
          ],
        },
      ],
    },
    {
      title: '02. 영업',
      items: [
        {
          title: '계약관리',
          icon: FileText,
          items: [
            { title: '프로젝트등록', url: '/sales/contract/project' },
            { title: '제안내역등록', url: '/sales/contract/proposal' },
            { title: '변경제안내역생성/삭제', url: '/sales/contract/proposal-change' },
            { title: '계약내역등록', url: '/sales/contract/register' },
            { title: '계약등록오류검증', url: '/sales/contract/validate' },
            { title: '변경계약생성/삭제', url: '/sales/contract/change' },
            { title: '계약품목현황', url: '/sales/contract/items' },
            { title: '계약실적현황', url: '/sales/contract/performance' },
          ],
        },
        { title: '구매의뢰등록', url: '/sales/purchase-request', icon: ShoppingCart },
        {
          title: '세금계산서',
          icon: Receipt,
          items: [
            { title: '매출세금계산서', url: '/sales/tax-invoice/issue' },
            { title: '세금계산서발행현황', url: '/sales/tax-invoice/status' },
          ],
        },
        { title: '프로젝트수금실적현황', url: '/sales/collection', icon: Coins },
      ],
    },
    {
      title: '03. 구매',
      items: [
        {
          title: '거래처관리',
          icon: Building2,
          items: [{ title: '거래처등록', url: '/customers' }],
        },
        { title: '프로젝트수금실적현황', url: '/purchase/collection', icon: Coins },
      ],
    },
    {
      title: '04. 재무',
      items: [
        {
          title: '전표관리',
          icon: BookText,
          items: [
            { title: '전표계정별조회', url: '/finance/voucher/by-account' },
            { title: '전표일자별조회', url: '/finance/voucher/by-date' },
          ],
        },
        {
          title: '법인카드',
          icon: CreditCard,
          items: [
            { title: '법인카드(승인/매입)내역', url: '/finance/card/usage' },
            { title: '법인카드청구내역', url: '/finance/card/billing' },
            { title: '법인카드처리현황', url: '/finance/card/status' },
          ],
        },
      ],
    },
    {
      title: '05. 인사',
      items: [
        {
          title: '인적사항',
          icon: Contact,
          items: [
            { title: '인사정보상세', url: '/hr/employees' },
            { title: '학력/경력사항', url: '/hr/personal/education' },
            { title: '업무이력사항', url: '/hr/personal/history' },
          ],
        },
        { title: '조직도', url: '/hr/departments', icon: Network },
        {
          title: '근태관리',
          icon: CalendarClock,
          items: [
            { title: '출퇴근부등록', url: '/hr/attendance/register' },
            { title: '출퇴근부관리자확인', url: '/hr/attendance/manager-confirm' },
            { title: '출퇴근부조회', url: '/hr/attendance/view' },
            { title: '월근로시간통계현황', url: '/hr/attendance/monthly-stats' },
            { title: '휴가계신청', url: '/hr/attendance/leave-apply' },
            { title: '휴가계신청취소', url: '/hr/attendance/leave-cancel' },
            { title: '단체연차미사용사유서', url: '/hr/attendance/unused-leave' },
            { title: '휴직(복직)계신청', url: '/hr/attendance/leave-of-absence' },
            { title: '연장근로신청', url: '/hr/attendance/overtime-apply' },
            { title: '연장근로취소신청', url: '/hr/attendance/overtime-cancel' },
            { title: '휴일근로신청', url: '/hr/attendance/holiday-work-apply' },
            { title: '휴일근로취소신청', url: '/hr/attendance/holiday-work-cancel' },
            { title: '휴가현황관리', url: '/hr/attendance/leave-status' },
          ],
        },
        {
          title: '급여조회',
          icon: Banknote,
          items: [
            { title: '급여명세표', url: '/hr/payroll/payslip' },
            { title: '성과실적및보상지급현황', url: '/hr/payroll/incentive-status' },
            { title: '개인별MBO성과금상세내역', url: '/hr/payroll/mbo-detail' },
            { title: '연봉조정내역서', url: '/hr/payroll/salary-adjustment' },
            { title: '근로소득원천징수부', url: '/hr/payroll/withholding-ledger' },
            { title: '근로소득원천징수영수증(구)', url: '/hr/payroll/withholding-receipt' },
            { title: '경비지급내역서', url: '/hr/payroll/expense-statement' },
          ],
        },
        {
          title: '실적관리',
          icon: BarChart3,
          items: [
            { title: '팀목표대비실적현황', url: '/hr/performance/team-goal' },
            { title: '개인목표대비실적현황', url: '/hr/performance/personal-goal' },
            { title: '매출실적상세현황', url: '/hr/performance/sales-detail' },
          ],
        },
        {
          title: '교육관리',
          icon: GraduationCap,
          items: [
            { title: '사외교육신청', url: '/hr/education/external-apply' },
            { title: '사외교육수강보고서', url: '/hr/education/external-report' },
            { title: '사외교육취소신청', url: '/hr/education/external-cancel' },
            { title: '도서구매의뢰', url: '/hr/education/book-request' },
            { title: '비즈니스자격신청', url: '/hr/education/cert-apply' },
            { title: '비즈니스자격결과보고서', url: '/hr/education/cert-report' },
            { title: '비즈니스자격취소신청', url: '/hr/education/cert-cancel' },
            { title: '교육이력조회', url: '/hr/education/history' },
          ],
        },
        { title: '제증명신청/출력', url: '/hr/certificate', icon: FileBadge },
        {
          title: '연말정산',
          icon: Calculator,
          items: [
            { title: '소득세액공제/간소화PDF등록', url: '/hr/year-end/deduction-pdf' },
            { title: '공제자료등록확인', url: '/hr/year-end/deduction-confirm' },
          ],
        },
        { title: '퇴직금지급명세서(DC)', url: '/hr/severance', icon: PiggyBank },
        { title: '면접평가', url: '/hr/interview', icon: UserCheck },
      ],
    },
    {
      title: '06. 평가',
      items: [
        {
          title: '업적목표등록',
          icon: Target,
          items: [
            { title: '직무사업성등록', url: '/eval/goal/job-feasibility' },
            { title: '직무사업서조회', url: '/eval/goal/job-spec-view' },
            { title: '성과책임등록', url: '/eval/goal/responsibility' },
            { title: '업적목표등록', url: '/eval/goal/register' },
            { title: '업적목표확정(1차/2차)', url: '/eval/goal/confirm' },
            { title: '업적목표면담', url: '/eval/goal/interview' },
          ],
        },
        {
          title: '업적평가',
          icon: ClipboardCheck,
          items: [
            { title: '본인평가', url: '/eval/appraisal/self' },
            { title: '업적평가(1차/2차)', url: '/eval/appraisal/review' },
          ],
        },
        {
          title: '평가진행현황',
          icon: ListChecks,
          items: [
            { title: '업적목표SHEET삭제', url: '/eval/progress/sheet-delete' },
            { title: '직무성과평가현황', url: '/eval/progress/status' },
            { title: '피평가자현황', url: '/eval/progress/evaluatee' },
          ],
        },
      ],
    },
    {
      title: '07. 총무',
      items: [
        {
          title: '비용신청',
          icon: Wallet,
          items: [
            { title: '경조금지급신청', url: '/ga/expense/congratulation' },
            { title: '지출품의신청', url: '/ga/expense/disbursement' },
            { title: '학자금지급신청', url: '/ga/expense/tuition' },
            { title: '차량지원금신청', url: '/ga/expense/vehicle-subsidy' },
            { title: '시내외교통비신청', url: '/ga/expense/transport' },
            { title: '업무용승용차운행기록', url: '/ga/expense/vehicle-log' },
            { title: '업무용승용차운행기록(인쇄)', url: '/ga/expense/vehicle-log-print' },
            { title: '식권신청', url: '/ga/expense/meal-ticket' },
          ],
        },
        {
          title: '인감관리',
          icon: Stamp,
          items: [
            { title: '사용인감신청', url: '/ga/seal/use-apply' },
            { title: '법인인감신청', url: '/ga/seal/corporate-apply' },
            { title: '사용인감반출신청', url: '/ga/seal/use-export' },
            { title: '지문인식기반출신청', url: '/ga/seal/fingerprint-export' },
            { title: '전자계약신청', url: '/ga/seal/e-contract' },
          ],
        },
        { title: '대출상환현황조회', url: '/ga/welfare/loan', icon: HandCoins },
        { title: '콘도예약신청', url: '/ga/condo', icon: Building },
      ],
    },
    {
      title: '08. 공통',
      items: [
        {
          title: '공통운영',
          icon: Megaphone,
          items: [
            { title: '시스템안내', url: '/common/notice' },
            { title: '사용자', url: '/users' },
          ],
        },
      ],
    },
  ],
}
