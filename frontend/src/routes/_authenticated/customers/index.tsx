import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Customers } from '@/features/customers'
import { tradeTypes } from '@/features/customers/data/data'

const customerSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  tradeType: z
    .array(z.enum(tradeTypes.map((t) => t.value)))
    .optional()
    .catch([]),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/customers/')({
  validateSearch: customerSearchSchema,
  component: Customers,
})
