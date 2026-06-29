import { createFileRoute } from '@tanstack/react-router'
import { CommonCodePage } from '@/features/common/code/code-page'

export const Route = createFileRoute('/_authenticated/common/code')({
  component: CommonCodePage,
})
