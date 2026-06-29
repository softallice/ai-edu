import { createFileRoute } from '@tanstack/react-router'
import { SealCorporateApplyPage } from '@/features/ga/seal/corporate-apply-page'

export const Route = createFileRoute('/_authenticated/ga/seal/corporate-apply')({
  component: SealCorporateApplyPage,
})
