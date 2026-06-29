import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export type EmployeeResponse = {
  id: number
  employeeNo: string
  name: string
  active: boolean
}

/** 월 표준 근무시간 (h) */
export const STANDARD_MONTHLY_HOURS = 160

const empKey = ['utilization', 'employees'] as const

export function useEmployees() {
  return useQuery({
    queryKey: empKey,
    queryFn: async () =>
      (await apiClient.get<EmployeeResponse[]>('/api/hr/employees')).data,
  })
}
