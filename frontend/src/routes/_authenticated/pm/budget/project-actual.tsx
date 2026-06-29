import { createFileRoute } from '@tanstack/react-router'
import { ProjectBudgetActualPage } from '@/features/pm/budget/project-actual-page'

export const Route = createFileRoute(
  '/_authenticated/pm/budget/project-actual'
)({
  component: ProjectBudgetActualPage,
})
