import { createFileRoute } from '@tanstack/react-router'
import { MealTicketPage } from '@/features/ga/expense/meal-ticket-page'

export const Route = createFileRoute('/_authenticated/ga/expense/meal-ticket')({
  component: MealTicketPage,
})
