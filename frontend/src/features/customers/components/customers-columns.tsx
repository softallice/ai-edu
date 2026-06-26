import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { tradeTypes } from '../data/data'
import { type CustomerSummary } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const customersColumns: ColumnDef<CustomerSummary>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='전체 선택'
        className='translate-y-0.5'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='행 선택'
        className='translate-y-0.5'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='거래처코드' />
    ),
    cell: ({ row }) => <div className='w-20'>{row.getValue('code')}</div>,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='거래처명' />
    ),
    meta: { className: 'ps-1 max-w-0 w-1/3', tdClassName: 'ps-4' },
    cell: ({ row }) => (
      <span className='truncate font-medium'>{row.getValue('name')}</span>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'tradeType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='구분' />
    ),
    cell: ({ row }) => {
      const tradeType = tradeTypes.find(
        (t) => t.value === row.getValue('tradeType')
      )
      if (!tradeType) return null
      return (
        <div className='flex items-center gap-2'>
          {tradeType.icon && (
            <tradeType.icon className='size-4 text-muted-foreground' />
          )}
          <span>{tradeType.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'representativeName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='대표자' />
    ),
    cell: ({ row }) => <span>{row.getValue('representativeName') ?? '-'}</span>,
  },
  {
    accessorKey: 'businessRegNo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='사업자번호' />
    ),
  },
  {
    accessorKey: 'active',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='사용여부' />
    ),
    cell: ({ row }) => {
      const active = row.getValue('active') as boolean
      return (
        <Badge variant={active ? 'default' : 'outline'}>
          {active ? '사용' : '미사용'}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
