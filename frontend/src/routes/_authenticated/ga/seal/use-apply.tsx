import { createFileRoute } from '@tanstack/react-router'
import { SealUseApplyPage } from '@/features/ga/seal/use-apply-page'

export const Route = createFileRoute('/_authenticated/ga/seal/use-apply')({
  component: SealUseApplyPage,
})
