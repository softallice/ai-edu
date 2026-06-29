import { createFileRoute } from '@tanstack/react-router'
import { VendorBillGoodsPage } from '@/features/purchase/vendor-bill/goods-page'

export const Route = createFileRoute('/_authenticated/purchase/bill/goods')({
  component: VendorBillGoodsPage,
})
