import { createFileRoute } from '@tanstack/react-router'
import { PersonalUtilizationPage } from '@/features/pm/utilization/personal-page'

export const Route = createFileRoute('/_authenticated/pm/utilization/personal')(
  {
    component: PersonalUtilizationPage,
  }
)
