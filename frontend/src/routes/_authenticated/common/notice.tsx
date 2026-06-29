import { createFileRoute } from '@tanstack/react-router'
import { NoticePage } from '@/features/common/notice/notice-page'

export const Route = createFileRoute('/_authenticated/common/notice')({
  component: NoticePage,
})
