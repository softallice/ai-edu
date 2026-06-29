import { createFileRoute } from '@tanstack/react-router'
import { PurchaseCollectionPage } from '@/features/purchase/collection/collection-page'

export const Route = createFileRoute('/_authenticated/purchase/collection')({
  component: PurchaseCollectionPage,
})
