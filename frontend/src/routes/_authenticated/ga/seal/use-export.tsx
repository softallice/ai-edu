import { createFileRoute } from '@tanstack/react-router'
import { SealUseExportPage } from '@/features/ga/seal/use-export-page'

export const Route = createFileRoute('/_authenticated/ga/seal/use-export')({
  component: SealUseExportPage,
})
