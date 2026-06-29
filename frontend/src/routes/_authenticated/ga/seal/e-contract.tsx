import { createFileRoute } from '@tanstack/react-router'
import { SealEContractPage } from '@/features/ga/seal/e-contract-page'

export const Route = createFileRoute('/_authenticated/ga/seal/e-contract')({
  component: SealEContractPage,
})
