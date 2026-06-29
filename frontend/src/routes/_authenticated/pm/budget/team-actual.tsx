import { createFileRoute } from '@tanstack/react-router'
import { TeamBudgetActualPage } from '@/features/pm/budget/team-actual-page'

export const Route = createFileRoute('/_authenticated/pm/budget/team-actual')({
  component: TeamBudgetActualPage,
})
