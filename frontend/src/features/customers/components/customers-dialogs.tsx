import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteCustomer } from '../api'
import { CustomersMutateDrawer } from './customers-mutate-drawer'
import { useCustomers_ui } from './customers-provider'

export function CustomersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useCustomers_ui()
  const deleteMutation = useDeleteCustomer()

  return (
    <>
      <CustomersMutateDrawer
        key='customer-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      {currentRow && (
        <>
          <CustomersMutateDrawer
            key={`customer-update-${currentRow.id}`}
            open={open === 'update'}
            onOpenChange={() => {
              setOpen('update')
              setTimeout(() => setCurrentRow(null), 500)
            }}
            currentRow={currentRow}
          />

          <ConfirmDialog
            key='customer-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => setCurrentRow(null), 500)
            }}
            handleConfirm={() => {
              deleteMutation.mutate(currentRow.id, {
                onSuccess: () => {
                  toast.success('거래처를 삭제했습니다.')
                  setOpen(null)
                  setTimeout(() => setCurrentRow(null), 500)
                },
              })
            }}
            className='max-w-md'
            title={`거래처 삭제: ${currentRow.code}`}
            desc={
              <>
                <strong>{currentRow.name}</strong> 거래처를 삭제합니다. <br />
                이 작업은 되돌릴 수 없습니다.
              </>
            }
            confirmText='삭제'
          />
        </>
      )}
    </>
  )
}
