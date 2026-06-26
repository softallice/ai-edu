import { z } from 'zod'

// 백엔드 TradeType(BUY_SALE_GB 이관) 과 정렬
export const tradeTypeEnum = z.enum(['BUY', 'SALE', 'BOTH'])
export type TradeType = z.infer<typeof tradeTypeEnum>

// 거래처 담당자 (백엔드 CustomerContactResponse / BE10C)
export const contactSchema = z.object({
  id: z.number().optional(),
  department: z.string(),
  name: z.string(),
  telNo: z.string().nullish(),
  email: z.string().nullish(),
})
export type Contact = z.infer<typeof contactSchema>

// 목록(요약) — 백엔드 CustomerSummaryResponse
export const customerSummarySchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  tradeType: tradeTypeEnum,
  representativeName: z.string().nullish(),
  businessRegNo: z.string(),
  active: z.boolean(),
})
export type CustomerSummary = z.infer<typeof customerSummarySchema>

// 상세 — 백엔드 CustomerResponse
export const customerSchema = customerSummarySchema.extend({
  shortName: z.string().nullish(),
  corporateRegNo: z.string().nullish(),
  businessCondition: z.string().nullish(),
  businessItem: z.string().nullish(),
  postNo: z.string().nullish(),
  address1: z.string().nullish(),
  address2: z.string().nullish(),
  telNo: z.string().nullish(),
  faxNo: z.string().nullish(),
  email: z.string().nullish(),
  taxType: z.string().nullish(),
  foundDate: z.string().nullish(),
  tradeStartDate: z.string().nullish(),
  tradeEndDate: z.string().nullish(),
  electronicContract: z.boolean(),
  contacts: z.array(contactSchema),
})
export type Customer = z.infer<typeof customerSchema>

// 생성/수정 폼 — 백엔드 CustomerRequest 와 정렬 (레거시 POVM0001 SAVE00)
export const customerFormSchema = z.object({
  businessRegNo: z.string().min(1, '사업자번호를 입력하세요.'),
  name: z.string().min(1, '거래처명을 입력하세요.'),
  shortName: z.string().optional(),
  tradeType: tradeTypeEnum,
  representativeName: z.string().optional(),
  email: z
    .string()
    .email('이메일 형식이 올바르지 않습니다.')
    .optional()
    .or(z.literal('')),
  telNo: z.string().optional(),
  address1: z.string().optional(),
  active: z.boolean(),
  electronicContract: z.boolean(),
  contacts: z.array(
    z.object({
      department: z.string().min(1, '소속을 입력하세요.'),
      name: z.string().min(1, '성명을 입력하세요.'),
      telNo: z.string().optional(),
      email: z
        .string()
        .email('이메일 형식이 올바르지 않습니다.')
        .optional()
        .or(z.literal('')),
    })
  ),
})
export type CustomerForm = z.infer<typeof customerFormSchema>
