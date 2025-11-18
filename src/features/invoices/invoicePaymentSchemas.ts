import { pipe, Schema } from 'effect'

import { ZonedDateTimeFromSelf } from '@schemas/common/zonedDateTimeFromSelf'
import { PaymentMethodSchema, TransformedPaymentMethodSchema } from '@components/PaymentMethod/schemas'

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

export const DedicatedInvoicePaymentFormSchema = Schema.Struct({
  amount: Schema.BigDecimal,

  method: Schema.NullOr(PaymentMethodSchema),

  paidAt: Schema.NullOr(ZonedDateTimeFromSelf),

  referenceNumber: Schema.String,

  memo: Schema.String,
})
export type DedicatedInvoicePaymentForm = typeof DedicatedInvoicePaymentFormSchema.Type

export const InvoicePaymentSchema = Schema.Struct({
  amount: Schema.Number,

  method: TransformedPaymentMethodSchema,

  at: Schema.propertySignature(Schema.Date),

  referenceNumber: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),

  memo: Schema.NullOr(Schema.String),
})
export type InvoicePayment = typeof InvoicePaymentSchema.Type
