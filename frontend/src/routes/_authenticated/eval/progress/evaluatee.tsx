import { createFileRoute } from '@tanstack/react-router'
import { EvaluateePage } from '@/features/eval/appraisal/evaluatee-page'

export const Route = createFileRoute('/_authenticated/eval/progress/evaluatee')(
  {
    component: EvaluateePage,
  }
)
