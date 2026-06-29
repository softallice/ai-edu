import { createFileRoute } from '@tanstack/react-router'
import { ComingSoon } from '@/components/coming-soon'

// 미구현 메뉴 경로의 캐치올(splat) 라우트 — koerp 메뉴 항목 중 아직 화면이 없는 경로는
// "준비중(Coming soon)"으로 표시합니다. 구현된 라우트(/customers, /tasks 등)가 우선합니다.
export const Route = createFileRoute('/_authenticated/$')({
  component: ComingSoon,
})
