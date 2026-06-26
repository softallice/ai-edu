import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type CustomerSummary } from '../data/schema'

type CustomersDialogType = 'create' | 'update' | 'delete'

type CustomersContextType = {
  open: CustomersDialogType | null
  setOpen: (str: CustomersDialogType | null) => void
  currentRow: CustomerSummary | null
  setCurrentRow: React.Dispatch<React.SetStateAction<CustomerSummary | null>>
}

const CustomersContext = React.createContext<CustomersContextType | null>(null)

export function CustomersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<CustomersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<CustomerSummary | null>(null)

  return (
    <CustomersContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </CustomersContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCustomers_ui = () => {
  const ctx = React.useContext(CustomersContext)
  if (!ctx) {
    throw new Error('useCustomers_ui has to be used within <CustomersProvider>')
  }
  return ctx
}
