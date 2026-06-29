import { createFileRoute } from '@tanstack/react-router'
import { VoucherByDatePage } from '@/features/finance/voucher/by-date-page'

export const Route = createFileRoute('/_authenticated/finance/voucher/by-date')(
  {
    component: VoucherByDatePage,
  }
)
