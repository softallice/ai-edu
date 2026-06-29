import { createFileRoute } from '@tanstack/react-router'
import { PersonalEducationPage } from '@/features/hr/personal/education-page'

export const Route = createFileRoute('/_authenticated/hr/personal/education')({
  component: PersonalEducationPage,
})
