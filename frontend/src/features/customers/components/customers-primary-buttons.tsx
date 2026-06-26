import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCustomers_ui } from './customers-provider'

export function CustomersPrimaryButtons() {
  const { setOpen } = useCustomers_ui()
  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>거래처 등록</span> <Plus size={18} />
      </Button>
    </div>
  )
}
