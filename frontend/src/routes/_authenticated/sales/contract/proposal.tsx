import { createFileRoute } from '@tanstack/react-router'
import { ProposalPage } from '@/features/sales/proposal/proposal-page'

export const Route = createFileRoute('/_authenticated/sales/contract/proposal')(
  {
    component: ProposalPage,
  }
)
