import { createFileRoute } from '@tanstack/react-router'
import { CertApplyPage } from '@/features/hr/education/cert-apply-page'

export const Route = createFileRoute(
  '/_authenticated/hr/education/cert-apply'
)({
  component: CertApplyPage,
})
