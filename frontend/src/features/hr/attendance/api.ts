import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export type AttendanceStatus = 'NORMAL' | 'LATE' | 'LEAVE' | 'ABSENT'

export type Attendance = {
  id: number
  code: string
  employeeId: number
  employeeNo: string
  employeeName: string
  workDate: string
  checkIn: string | null
  checkOut: string | null
  workHours: number
  status: AttendanceStatus
  note: string | null
}

export type AttendanceInput = {
  employeeId: number
  workDate: string
  checkIn?: string | null
  checkOut?: string | null
  workHours?: number | null
  status: AttendanceStatus
  note?: string | null
}

export type AttendanceQuery = {
  employeeId?: number
  status?: AttendanceStatus
  dateFrom?: string
  dateTo?: string
}

export type EmployeeResponse = {
  id: number
  employeeNo: string
  name: string
  active: boolean
}

const BASE = '/api/hr/attendances'
const key = ['hr', 'attendances'] as const
const EMP_BASE = '/api/hr/employees'
const empKey = ['hr', 'employees-list'] as const

export function useAttendances(query: AttendanceQuery) {
  return useQuery({
    queryKey: [...key, query],
    queryFn: async () => {
      const params: Record<string, string | number> = {}
      if (query.employeeId) params.employeeId = query.employeeId
      if (query.status) params.status = query.status
      if (query.dateFrom) params.dateFrom = query.dateFrom
      if (query.dateTo) params.dateTo = query.dateTo
      return (await apiClient.get<Attendance[]>(BASE, { params })).data
    },
  })
}

export function useSaveAttendance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, body }: { id?: number; body: AttendanceInput }) =>
      id
        ? (await apiClient.put<Attendance>(`${BASE}/${id}`, body)).data
        : (await apiClient.post<Attendance>(BASE, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export function useDeleteAttendance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`${BASE}/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

/** 직원 목록 훅 (드롭다운용). */
export function useEmployeeList() {
  return useQuery({
    queryKey: empKey,
    queryFn: async () =>
      (await apiClient.get<EmployeeResponse[]>(EMP_BASE)).data,
  })
}

export const ATTENDANCE_STATUS: Record<AttendanceStatus, string> = {
  NORMAL: '정상',
  LATE: '지각',
  LEAVE: '휴가',
  ABSENT: '결근',
}
