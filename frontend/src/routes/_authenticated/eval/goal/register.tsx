import { createFileRoute } from '@tanstack/react-router'
import { EvalGoalRegisterPage } from '@/features/eval/goal/register-page'

export const Route = createFileRoute('/_authenticated/eval/goal/register')({
  component: EvalGoalRegisterPage,
})
