import { createFileRoute } from '@tanstack/react-router'
import { TuitionPage } from '@/features/ga/expense/tuition-page'

export const Route = createFileRoute('/_authenticated/ga/expense/tuition')({
  component: TuitionPage,
})
