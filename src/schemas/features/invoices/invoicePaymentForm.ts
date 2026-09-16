import { Schema } from 'effect'

import { NonRecursiveBigDecimalSchema } from '@schemas/common/nonRecursiveBigDecimal'
import { ZonedDateTimeFromSelf } from '@schemas/common/zonedDateTimeFromSelf'
import { PaymentMethodSchema } from '@schemas/features/invoices/paymentMethod'

export const DedicatedInvoicePaymentFormSchema = Schema.Struct({
  amount: NonRecursiveBigDecimalSchema,

  method: Schema.NullOr(PaymentMethodSchema),

  paidAt: Schema.NullOr(ZonedDateTimeFromSelf),

  referenceNumber: Schema.String,

  memo: Schema.String,
})
export type DedicatedInvoicePaymentForm = typeof DedicatedInvoicePaymentFormSchema.Type
