import { pipe, Schema } from 'effect'

import { PaymentMethodSchema } from '@schemas/features/invoices/paymentMethod'

export const UpsertDedicatedInvoicePaymentSchema = Schema.Struct({
  amount: Schema.Number,

  method: PaymentMethodSchema,

  paidAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('paid_at'),
  ),

  referenceNumber: Schema.optional(Schema.String).pipe(
    Schema.fromKey('reference_number'),
  ),

  memo: Schema.optional(Schema.String),
})
export type UpsertDedicatedInvoicePayment = typeof UpsertDedicatedInvoicePaymentSchema.Type
