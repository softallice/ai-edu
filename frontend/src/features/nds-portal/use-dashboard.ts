import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { Project, Timesheet } from '@/features/pm/activity/api'
import type { Employee } from '@/features/hr/api'
import type { ContractSummary } from '@/features/sales/contract/api'

// ─── Raw fetch helpers (no mutation needed for dashboard reads) ───────────────

async function fetchProjects(): Promise<Project[]> {
  try {
    return (await apiClient.get<Project[]>('/api/pm/projects')).data
  } catch {
    return []
  }
}

async function fetchTimesheets(): Promise<Timesheet[]> {
  try {
    return (await apiClient.get<Timesheet[]>('/api/pm/timesheets')).data
  } catch {
    return []
  }
}

async function fetchEmployees(): Promise<Employee[]> {
  try {
    return (await apiClient.get<Employee[]>('/api/hr/employees')).data
  } catch {
    return []
  }
}

async function fetchContracts(): Promise<ContractSummary[]> {
  try {
    return (await apiClient.get<ContractSummary[]>('/api/sales/contracts')).data
  } catch {
    return []
  }
}

// ─── Derived types ───────────────────────────────────────────────────────────

export type MonthlyTrend = {
  month: string   // '1월' … '12월'
  hours: number
  amount: number
}

export type ProjectStatusDist = {
  status: string
  label: string
  count: number
  fill: string
}

export type DeptHeadcount = {
  dept: string
  count: number
}

export type KpiData = {
  activeProjects: number
  totalEmployees: number
  monthlyHours: number
  contractTotal: number
  contractCount: number
}

// ─── Aggregation helpers (pure functions) ────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  PLANNED: '계획',
  IN_PROGRESS: '진행중',
  ON_HOLD: '보류',
  DONE: '완료',
  CANCELLED: '취소',
}

const STATUS_COLOR: Record<string, string> = {
  PLANNED:    'var(--color-planned)',
  IN_PROGRESS:'var(--color-in-progress)',
  ON_HOLD:    'var(--color-on-hold)',
  DONE:       'var(--color-done)',
  CANCELLED:  'var(--color-cancelled)',
}

function buildKpi(
  projects: Project[],
  timesheets: Timesheet[],
  employees: Employee[],
  contracts: ContractSummary[]
): KpiData {
  const now = new Date()
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const activeProjects = projects.filter((p) => p.status === 'IN_PROGRESS').length
  const totalEmployees = employees.filter((e) => e.active).length
  const monthlyHours = timesheets
    .filter((t) => t.workDate.startsWith(ym))
    .reduce((sum, t) => sum + t.hours, 0)
  const activeContracts = contracts.filter((c) => c.active)
  const contractTotal = activeContracts.reduce((sum, c) => sum + (c.totalAmount ?? 0), 0)
  const contractCount = activeContracts.length

  return { activeProjects, totalEmployees, monthlyHours, contractTotal, contractCount }
}

function buildMonthlyTrend(
  timesheets: Timesheet[],
  contracts: ContractSummary[]
): MonthlyTrend[] {
  const now = new Date()
  const months: MonthlyTrend[] = []

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = `${d.getMonth() + 1}월`

    const hours = timesheets
      .filter((t) => t.workDate.startsWith(ym))
      .reduce((sum, t) => sum + t.hours, 0)

    const amount = contracts
      .filter((c) => c.contractDate?.startsWith(ym))
      .reduce((sum, c) => sum + (c.totalAmount ?? 0), 0)

    months.push({ month: label, hours, amount })
  }

  return months
}

function buildProjectStatus(projects: Project[]): ProjectStatusDist[] {
  const counts: Record<string, number> = {}
  for (const p of projects) {
    counts[p.status] = (counts[p.status] ?? 0) + 1
  }

  return Object.entries(counts).map(([status, count]) => ({
    status,
    label: STATUS_LABEL[status] ?? status,
    count,
    fill: STATUS_COLOR[status] ?? 'var(--color-done)',
  }))
}

function buildDeptHeadcount(employees: Employee[]): DeptHeadcount[] {
  const counts: Record<string, number> = {}
  for (const e of employees.filter((x) => x.active)) {
    const dept = e.departmentName ?? '미배정'
    counts[dept] = (counts[dept] ?? 0) + 1
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([dept, count]) => ({ dept, count }))
}

// ─── useDashboard ─────────────────────────────────────────────────────────────

export function useDashboard() {
  const results = useQueries({
    queries: [
      { queryKey: ['pm', 'projects'], queryFn: fetchProjects, staleTime: 60_000 },
      { queryKey: ['pm', 'timesheets', 'dashboard'], queryFn: fetchTimesheets, staleTime: 60_000 },
      { queryKey: ['hr', 'employees', 'dashboard'], queryFn: fetchEmployees, staleTime: 60_000 },
      { queryKey: ['sales', 'contracts', 'dashboard'], queryFn: fetchContracts, staleTime: 60_000 },
    ],
  })

  const isLoading = results.some((r) => r.isLoading)

  const projects   = results[0].data ?? []
  const timesheets = results[1].data ?? []
  const employees  = results[2].data ?? []
  const contracts  = results[3].data ?? []

  const kpi = useMemo(
    () => buildKpi(projects, timesheets, employees, contracts),
    [projects, timesheets, employees, contracts]
  )

  const monthlyTrend = useMemo(
    () => buildMonthlyTrend(timesheets, contracts),
    [timesheets, contracts]
  )

  const projectStatus = useMemo(
    () => buildProjectStatus(projects),
    [projects]
  )

  const deptHeadcount = useMemo(
    () => buildDeptHeadcount(employees),
    [employees]
  )

  const recentContracts = useMemo(
    () =>
      [...contracts]
        .sort((a, b) => (b.contractDate ?? '').localeCompare(a.contractDate ?? ''))
        .slice(0, 5),
    [contracts]
  )

  return {
    isLoading,
    kpi,
    monthlyTrend,
    projectStatus,
    deptHeadcount,
    recentContracts,
  }
}
