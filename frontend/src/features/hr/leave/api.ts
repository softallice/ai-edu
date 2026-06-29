import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export type LeaveRequestType =
  | 'ANNUAL'
  | 'HALF_DAY'
  | 'SICK'
  | 'SPECIAL'
  | 'OVERTIME'
  | 'HOLIDAY_WORK'

export type LeaveRequestStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'CANCELED'

export type LeaveRequest = {
  id: number
  code: string
  employeeId: number
  employeeName: string
  departmentName: string | null
  requestType: LeaveRequestType
  startDate: string
  endDate: string
  days: number | null
  hours: number | null
  reason: string | null
  status: LeaveRequestStatus
  note: string | null
}

export type LeaveRequestInput = {
  employeeId: number
  requestType: LeaveRequestType
  startDate: string
  endDate: string
  days?: number | null
  hours?: number | null
  reason?: string | null
  status: LeaveRequestStatus
  note?: string | null
}

export type LeaveRequestQuery = {
  keyword?: string
  requestType?: LeaveRequestType
  status?: LeaveRequestStatus
  employeeId?: number
  dateFrom?: string
  dateTo?: string
}

export type EmployeeResponse = {
  id: number
  employeeNo: string
  name: string
  active: boolean
}

export const LEAVE_TYPE: Record<LeaveRequestType, string> = {
  ANNUAL: '연차',
  HALF_DAY: '반차',
  SICK: '병가',
  SPECIAL: '경조',
  OVERTIME: '연장근로',
  HOLIDAY_WORK: '휴일근로',
}

export const LEAVE_STATUS: Record<LeaveRequestStatus, string> = {
  REQUESTED: '신청',
  APPROVED: '승인',
  REJECTED: '반려',
  CANCELED: '취소',
}

/** 휴가류 유형 */
export const LEAVE_TYPES: LeaveRequestType[] = ['ANNUAL', 'HALF_DAY', 'SICK', 'SPECIAL']
/** 근로류 유형 */
export const WORK_TYPES: LeaveRequestType[] = ['OVERTIME', 'HOLIDAY_WORK']

const BASE = '/api/hr/leave-requests'
const key = ['hr', 'leave-requests'] as const
const EMP_BASE = '/api/hr/employees'
const empKey = ['hr', 'employees-leave'] as const

export function useLeaveRequests(query: LeaveRequestQuery) {
  return useQuery({
    queryKey: [...key, query],
    queryFn: async () => {
      const params: Record<string, string | number> = {}
      if (query.keyword) params.keyword = query.keyword
      if (query.requestType) params.requestType = query.requestType
      if (query.status) params.status = query.status
      if (query.employeeId) params.employeeId = query.employeeId
      if (query.dateFrom) params.dateFrom = query.dateFrom
      if (query.dateTo) params.dateTo = query.dateTo
      return (await apiClient.get<LeaveRequest[]>(BASE, { params })).data
    },
  })
}

export function useSaveLeaveRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id?: number; body: LeaveRequestInput }) =>
      id
        ? (await apiClient.put<LeaveRequest>(`${BASE}/${id}`, body)).data
        : (await apiClient.post<LeaveRequest>(BASE, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export function useDeleteLeaveRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`${BASE}/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

/** 직원 목록 훅 (드롭다운용). */
export function useEmployees() {
  return useQuery({
    queryKey: empKey,
    queryFn: async () =>
      (await apiClient.get<EmployeeResponse[]>(EMP_BASE)).data,
  })
}
