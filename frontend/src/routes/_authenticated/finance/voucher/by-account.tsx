import { createFileRoute } from '@tanstack/react-router'
import { VoucherByAccountPage } from '@/features/finance/voucher/by-account-page'

export const Route = createFileRoute(
  '/_authenticated/finance/voucher/by-account'
)({
  component: VoucherByAccountPage,
})
