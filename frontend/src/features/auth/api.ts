import { apiClient } from '@/lib/api-client'

export type LoginRequest = {
  email: string
  password: string
}

export type AuthUserPayload = {
  accountNo: string
  email: string
  name: string
  role: string[]
  exp: number
}

export type LoginResponse = {
  accessToken: string
  user: AuthUserPayload
}

// 로그인 (백엔드 POST /api/auth/login, 레거시 ComLogin_Login)
export async function login(body: LoginRequest): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/api/auth/login', body)
  return data
}

// 로그아웃 (무상태 — 서버는 no-op, 클라이언트가 토큰 폐기)
export async function logout(): Promise<void> {
  await apiClient.post('/api/auth/logout')
}
