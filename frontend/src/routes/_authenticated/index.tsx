import { createFileRoute } from '@tanstack/react-router'
import { NdsPortal } from '@/features/nds-portal'

export const Route = createFileRoute('/_authenticated/')({
  component: NdsPortal,
})
