import { createFileRoute } from '@tanstack/react-router'
import { ExternalEduApplyPage } from '@/features/hr/education/external-apply-page'

export const Route = createFileRoute(
  '/_authenticated/hr/education/external-apply'
)({
  component: ExternalEduApplyPage,
})
