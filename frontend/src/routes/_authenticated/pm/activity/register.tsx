import { createFileRoute } from '@tanstack/react-router'
import { ActivityRegisterPage } from '@/features/pm/activity/register-page'

export const Route = createFileRoute('/_authenticated/pm/activity/register')({
  component: ActivityRegisterPage,
})
