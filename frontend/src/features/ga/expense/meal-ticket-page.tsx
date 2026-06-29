import { ExpenseTypePage } from './expense-type-page'

export function MealTicketPage() {
  return (
    <ExpenseTypePage
      fixedType='MEAL'
      title='식권신청'
      subtitle='07.총무 / 비용신청 / 식권신청'
    />
  )
}
