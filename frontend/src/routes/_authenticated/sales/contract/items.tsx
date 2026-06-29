import { createFileRoute } from '@tanstack/react-router'
import { ContractItemsPage } from '@/features/sales/contract/items-page'

export const Route = createFileRoute('/_authenticated/sales/contract/items')({
  component: ContractItemsPage,
})
