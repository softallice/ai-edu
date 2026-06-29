import { createFileRoute } from '@tanstack/react-router'
import { EvalStatusPage } from '@/features/eval/appraisal/status-page'

export const Route = createFileRoute('/_authenticated/eval/progress/status')({
  component: EvalStatusPage,
})
