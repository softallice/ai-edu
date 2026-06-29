import { createFileRoute } from '@tanstack/react-router'
import { SelfAppraisalPage } from '@/features/eval/appraisal/self-page'

export const Route = createFileRoute('/_authenticated/eval/appraisal/self')({
  component: SelfAppraisalPage,
})
