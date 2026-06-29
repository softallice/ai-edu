import { createFileRoute } from '@tanstack/react-router'
import { CollectionPage } from '@/features/sales/collection/collection-page'

export const Route = createFileRoute('/_authenticated/sales/collection')({
  component: CollectionPage,
})
