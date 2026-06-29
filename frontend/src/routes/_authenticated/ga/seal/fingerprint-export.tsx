import { createFileRoute } from '@tanstack/react-router'
import { SealFingerprintExportPage } from '@/features/ga/seal/fingerprint-export-page'

export const Route = createFileRoute(
  '/_authenticated/ga/seal/fingerprint-export'
)({
  component: SealFingerprintExportPage,
})
