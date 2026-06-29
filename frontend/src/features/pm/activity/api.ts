import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export type Project = {
  id: number
  code: string
  name: string
  customerId: number | null
  customerName: string | null
  managerId: number | null
  managerName: string | null
  status: string
  dateStart: string | null
  dateEnd: string | null
  active: boolean
}

export type Timesheet = {
  id: number
  employeeId: number
  employeeName: string
  projectId: number
  projectCode: string
  projectName: string
  workDate: string
  hours: number
  activityType: string
  description: string | null
  billable: boolean
  validated: boolean
  validatedAt: string | null
}

export type TimesheetInput = {
  employeeId: number
  projectId: number
  workDate: string
  hours: number
  activityType: string
  description?: string | null
  billable?: boolean
}

export type TimesheetQuery = {
  employeeId?: number
  projectId?: number
  dateFrom?: string
  dateTo?: string
  validated?: boolean
}

const projectsKey = ['pm', 'projects'] as const
const timesheetsKey = ['pm', 'timesheets'] as const

export function useProjects() {
  return useQuery({
    queryKey: projectsKey,
    queryFn: async () =>
      (await apiClient.get<Project[]>('/api/pm/projects')).data,
  })
}

export function useTimesheets(query: TimesheetQuery) {
  return useQuery({
    queryKey: [...timesheetsKey, query],
    queryFn: async () => {
      const params: Record<string, string | number | boolean> = {}
      if (query.employeeId) params.employeeId = query.employeeId
      if (query.projectId) params.projectId = query.projectId
      if (query.dateFrom) params.dateFrom = query.dateFrom
      if (query.dateTo) params.dateTo = query.dateTo
      if (query.validated != null) params.validated = query.validated
      return (
        await apiClient.get<Timesheet[]>('/api/pm/timesheets', { params })
      ).data
    },
  })
}

export function useSaveTimesheet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id?: number; body: TimesheetInput }) =>
      id
        ? (await apiClient.put<Timesheet>(`/api/pm/timesheets/${id}`, body))
            .data
        : (await apiClient.post<Timesheet>('/api/pm/timesheets', body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: timesheetsKey }),
  })
}

export function useDeleteTimesheet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/api/pm/timesheets/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: timesheetsKey }),
  })
}

export const ACTIVITY_TYPES: Record<string, string> = {
  DEVELOPMENT: '개발',
  DESIGN: '설계',
  MEETING: '회의',
  DOCUMENTATION: '문서',
  SUPPORT: '지원',
  EDUCATION: '교육',
  ETC: '기타',
}

export const PROJECT_STATUS: Record<string, string> = {
  PLANNED: '계획',
  IN_PROGRESS: '진행중',
  ON_HOLD: '보류',
  DONE: '완료',
  CANCELLED: '취소',
}
