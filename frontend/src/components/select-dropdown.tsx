import { useFormContext } from 'react-hook-form'
import { Loader } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FormControl } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Radix Select 는 SelectItem 의 value 로 빈 문자열을 허용하지 않는다.
// "전체"처럼 빈 value 항목을 내부적으로 이 센티넬로 치환한다.
const EMPTY_VALUE = '__empty__'

type SelectDropdownProps = {
  onValueChange?: (value: string) => void
  defaultValue: string | undefined
  placeholder?: string
  isPending?: boolean
  items: { label: string; value: string }[] | undefined
  disabled?: boolean
  className?: string
  isControlled?: boolean
}

export function SelectDropdown({
  defaultValue,
  onValueChange,
  isPending,
  items,
  placeholder,
  disabled,
  className = '',
  isControlled = false,
}: SelectDropdownProps) {
  // 빈 value(''=전체/clear)는 내부 센티넬로 보내고, 외부 콜백에는 다시 ''로 복원한다.
  const toInner = (v: string | undefined) => (v === '' ? EMPTY_VALUE : v)
  const handleChange = onValueChange
    ? (v: string) => onValueChange(v === EMPTY_VALUE ? '' : v)
    : undefined
  const defaultState = isControlled
    ? { value: toInner(defaultValue), onValueChange: handleChange }
    : { defaultValue: toInner(defaultValue), onValueChange: handleChange }
  // react-hook-form 컨텍스트 밖(useState 기반 화면)에서는 FormControl 이
  // useFormContext() null 참조로 크래시하므로, 폼 컨텍스트가 있을 때만 감싼다.
  const formContext = useFormContext()
  const trigger = (
    <SelectTrigger disabled={disabled} className={cn(className)}>
      <SelectValue placeholder={placeholder ?? 'Select'} />
    </SelectTrigger>
  )
  return (
    <Select {...defaultState}>
      {formContext ? <FormControl>{trigger}</FormControl> : trigger}
      <SelectContent>
        {isPending ? (
          <SelectItem disabled value='loading' className='h-14'>
            <div className='flex items-center justify-center gap-2'>
              <Loader className='h-5 w-5 animate-spin' />
              {'  '}
              Loading...
            </div>
          </SelectItem>
        ) : (
          items?.map(({ label, value }) => (
            <SelectItem key={value || EMPTY_VALUE} value={value || EMPTY_VALUE}>
              {label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}
