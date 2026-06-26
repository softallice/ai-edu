import { ArrowLeftRight, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'

// 매입매출구분(BUY_SALE_GB) 표시 메타데이터
export const tradeTypes = [
  { label: '매입', value: 'BUY' as const, icon: ArrowDownToLine },
  { label: '매출', value: 'SALE' as const, icon: ArrowUpFromLine },
  { label: '매입·매출', value: 'BOTH' as const, icon: ArrowLeftRight },
]
