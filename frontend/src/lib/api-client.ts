import axios from 'axios'
import { useAuthStore } from '@/stores/auth-store'

// 백엔드(ai-edu Spring Boot) 베이스 URL. 개발 기본값은 로컬 8080.
// .env 에 VITE_API_URL 을 두면 재정의됩니다(예: VITE_API_URL=http://localhost:8080).
const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export const apiClient = axios.create({ baseURL })

// 모든 요청에 로그인 시 저장한 JWT 를 Authorization 헤더로 부착합니다.
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().auth.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
