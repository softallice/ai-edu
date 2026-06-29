import { createFileRoute } from '@tanstack/react-router'
import { ContractRegisterPage } from '@/features/sales/contract/register-page'

export const Route = createFileRoute('/_authenticated/sales/contract/register')(
  {
    component: ContractRegisterPage,
  }
)
