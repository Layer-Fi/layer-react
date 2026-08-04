import { Schema } from 'effect'

import { NonRecursiveBigDecimalSchema } from '@schemas/common/nonRecursiveBigDecimal'
import { ZonedDateTimeFromSelf } from '@schemas/common/zonedDateTimeFromSelf'
import { CustomerSchema } from '@schemas/customerVendor/customer'
import { InvoiceTermsValues } from '@schemas/invoices/invoiceTerms'

export const InvoiceFormLineItemSchema = Schema.Struct({
  description: Schema.String,

  unitPrice: NonRecursiveBigDecimalSchema,

  quantity: NonRecursiveBigDecimalSchema,

  amount: NonRecursiveBigDecimalSchema,

  isTaxable: Schema.Boolean,
})
export type InvoiceFormLineItem = typeof InvoiceFormLineItemSchema.Type
export const InvoiceFormLineItemEquivalence = Schema.equivalence(InvoiceFormLineItemSchema)

const InvoiceTermsValuesSchema = Schema.Enums(InvoiceTermsValues)
export const InvoiceFormSchema = Schema.Struct({
  terms: InvoiceTermsValuesSchema,

  sentAt: Schema.NullOr(ZonedDateTimeFromSelf),

  dueAt: Schema.NullOr(ZonedDateTimeFromSelf),

  invoiceNumber: Schema.String,

  customer: Schema.NullOr(CustomerSchema),

  email: Schema.String,

  address: Schema.String,

  lineItems: Schema.Array(InvoiceFormLineItemSchema),

  discountRate: NonRecursiveBigDecimalSchema,

  taxRate: NonRecursiveBigDecimalSchema,

  memo: Schema.String,
})
export type InvoiceForm = Omit<typeof InvoiceFormSchema.Type, 'lineItems'> & {
  // Purposefully allow lineItems to be mutable for `field.pushValue` in the form
  lineItems: InvoiceFormLineItem[]
}
