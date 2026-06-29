import { createFileRoute } from '@tanstack/react-router'
import { ContractValidatePage } from '@/features/sales/contract/validate-page'

export const Route = createFileRoute('/_authenticated/sales/contract/validate')(
  {
    component: ContractValidatePage,
  }
)
