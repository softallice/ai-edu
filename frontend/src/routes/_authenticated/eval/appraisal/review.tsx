import { createFileRoute } from '@tanstack/react-router'
import { ReviewAppraisalPage } from '@/features/eval/appraisal/review-page'

export const Route = createFileRoute('/_authenticated/eval/appraisal/review')({
  component: ReviewAppraisalPage,
})
