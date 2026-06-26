import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SelectDropdown } from '@/components/select-dropdown'
import { useCreateCustomer, useCustomer, useUpdateCustomer } from '../api'
import { tradeTypes } from '../data/data'
import {
  customerFormSchema,
  type CustomerForm,
  type CustomerSummary,
} from '../data/schema'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: CustomerSummary
}

const emptyValues: CustomerForm = {
  businessRegNo: '',
  name: '',
  shortName: '',
  tradeType: 'BUY',
  representativeName: '',
  email: '',
  telNo: '',
  address1: '',
  active: true,
  electronicContract: false,
  contacts: [],
}

export function CustomersMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const isUpdate = !!currentRow
  const createMutation = useCreateCustomer()
  const updateMutation = useUpdateCustomer()
  // 수정 시 담당자 등 상세 정보를 불러옵니다 (목록 요약에는 담당자가 없음).
  const detailQuery = useCustomer(isUpdate ? currentRow!.id : null)

  const form = useForm<CustomerForm>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: emptyValues,
  })
  const contacts = useFieldArray({ control: form.control, name: 'contacts' })

  // 상세 로딩 완료 시 폼에 채움
  useEffect(() => {
    if (isUpdate && detailQuery.data) {
      const d = detailQuery.data
      form.reset({
        businessRegNo: d.businessRegNo,
        name: d.name,
        shortName: d.shortName ?? '',
        tradeType: d.tradeType,
        representativeName: d.representativeName ?? '',
        email: d.email ?? '',
        telNo: d.telNo ?? '',
        address1: d.address1 ?? '',
        active: d.active,
        electronicContract: d.electronicContract,
        contacts: d.contacts.map((c) => ({
          department: c.department,
          name: c.name,
          telNo: c.telNo ?? '',
          email: c.email ?? '',
        })),
      })
    }
    if (!isUpdate) {
      form.reset(emptyValues)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpdate, detailQuery.data])

  const onSubmit = (data: CustomerForm) => {
    const onSuccess = () => {
      toast.success(isUpdate ? '거래처를 수정했습니다.' : '거래처를 등록했습니다.')
      onOpenChange(false)
      form.reset(emptyValues)
    }
    if (isUpdate) {
      updateMutation.mutate({ id: currentRow!.id, body: data }, { onSuccess })
    } else {
      createMutation.mutate(data, { onSuccess })
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) form.reset(emptyValues)
      }}
    >
      <SheetContent className='flex flex-col sm:max-w-lg'>
        <SheetHeader className='text-start'>
          <SheetTitle>{isUpdate ? '거래처 수정' : '거래처 등록'}</SheetTitle>
          <SheetDescription>
            거래처 기본정보와 담당자를 입력한 뒤 저장하세요.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='customers-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-5 overflow-y-auto px-4'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>거래처명</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='예) 엔디에스(주)' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='businessRegNo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>사업자번호</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='숫자만 입력' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='tradeType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>매입매출구분</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='구분 선택'
                    items={tradeTypes.map((t) => ({
                      label: t.label,
                      value: t.value,
                    }))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='representativeName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>대표자</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='대표자 성명' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='telNo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>대표 전화</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='02-0000-0000' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='name@example.com' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='address1'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>주소</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='주소' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='flex gap-6'>
              <FormField
                control={form.control}
                name='active'
                render={({ field }) => (
                  <FormItem className='flex items-center gap-2'>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className='font-normal'>사용</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='electronicContract'
                render={({ field }) => (
                  <FormItem className='flex items-center gap-2'>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className='font-normal'>전자계약</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>담당자</span>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    contacts.append({
                      department: '',
                      name: '',
                      telNo: '',
                      email: '',
                    })
                  }
                >
                  <Plus size={14} /> 행추가
                </Button>
              </div>
              {contacts.fields.map((f, index) => (
                <div key={f.id} className='grid grid-cols-2 gap-2 rounded-md border p-2'>
                  <FormField
                    control={form.control}
                    name={`contacts.${index}.department`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} placeholder='소속' />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`contacts.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} placeholder='성명' />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`contacts.${index}.telNo`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} placeholder='전화번호' />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className='flex items-end gap-2'>
                    <FormField
                      control={form.control}
                      name={`contacts.${index}.email`}
                      render={({ field }) => (
                        <FormItem className='flex-1'>
                          <FormControl>
                            <Input {...field} placeholder='이메일' />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => contacts.remove(index)}
                      aria-label='행삭제'
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>닫기</Button>
          </SheetClose>
          <Button form='customers-form' type='submit' disabled={isPending}>
            저장
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
