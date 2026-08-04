import { pipe, Schema } from 'effect'

import { TransformedPaymentMethodSchema } from '@schemas/invoices/paymentMethod'

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
