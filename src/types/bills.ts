import { TransactionTag } from './tags'
import { Vendor } from './vendors'

const UNPAID_STATUS_MAP = {
  SENT: 'SENT',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
} as const
export type UnpaidStatuses = typeof UNPAID_STATUS_MAP[keyof typeof UNPAID_STATUS_MAP]
export const UNPAID_STATUSES = [UNPAID_STATUS_MAP.SENT, UNPAID_STATUS_MAP.PARTIALLY_PAID]

const PAID_STATUS_MAP = {
  PAID: 'PAID',
} as const
export type PaidStatuses = typeof PAID_STATUS_MAP[keyof typeof PAID_STATUS_MAP]
export const PAID_STATUS = PAID_STATUS_MAP.PAID

const VOIDED_STATUS_MAP = {
  VOIDED: 'VOIDED',
} as const
export type VoidedStatuses = typeof VOIDED_STATUS_MAP[keyof typeof VOIDED_STATUS_MAP]
export const VOIDED_STATUS = VOIDED_STATUS_MAP.VOIDED

export type BillStatus = UnpaidStatuses | PaidStatuses | VoidedStatuses

type BillTerm = 'DUE_ON_RECEIPT' | 'NET_10' | 'NET_15' | 'NET_30' | 'NET_60'

export const BillTerms: {
  id: BillTerm
  label: string
}[] = [{
  id: 'DUE_ON_RECEIPT',
  label: 'Due on receipt',
}, {
  id: 'NET_10',
  label: 'Net 10',
}, {
  id: 'NET_15',
  label: 'Net 15',
}, {
  id: 'NET_30',
  label: 'Net 30',
}, {
  id: 'NET_60',
  label: 'Net 60',
}]

export type Bill = {
  additional_sales_taxes: SalesTax[]
  additional_sales_taxes_total: number
  bill_number: string
  business_id: string
  due_at: string
  external_id: string
  id: string
  imported_at: string
  line_items: BillLineItem[]
  outstanding_balance: number
  paid_at?: string
  payment_allocations: PaymentAllocation[]
  received_at: string
  status: BillStatus
  subtotal: number
  terms: BillTerm
  total_amount: number
  transaction_tags: TransactionTag[]
  type: 'Bill'
  updated_at: string
  voided_at: string | null
  vendor: Vendor
}

export type BillLineItem = {
  account_identifier?: {
    type: string
    id: string
    product_name?: string
  }
  bill_id: string
  description: string
  external_id: string
  id: string
  product_name: string
  quantity: number
  sales_taxes: SalesTax[] | null
  sales_taxes_total?: number
  subtotal: number
  total_amount: number | string | null
  unit_price: number
  discount_amount?: number
}

type PaymentAllocation = {
  bill_id: string
  payment_id: string
  amount: number
  transaction_tags: TransactionTag[]
}

type SalesTax = {
  amount: number
  tax_account: TaxAccount
}

type TaxAccount = {
  id?: string
  name?: string
  type?: string
}

export const BillPaymentMethods = {
  ACH: 'ACH',
  CASH: 'Cash',
  CHECK: 'Check',
  CREDIT_CARD: 'Credit card',
  CREDIT_BALANCE: 'Credit balance',
  OTHER: 'Other',
} as const

export type BillPaymentMethod = typeof BillPaymentMethods[keyof typeof BillPaymentMethods]

type BillPaymentAllocation = {
  amount: number
  bill_id?: string
  bill_external_id?: string
}

export type BillPayment = {
  paid_at: string
  method: BillPaymentMethod
  amount: number
  bill_payment_allocations: BillPaymentAllocation[]
}
