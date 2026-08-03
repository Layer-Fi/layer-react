import { Schema } from 'effect'

import { ZonedDateTimeFromSelf } from '@schemas/common/zonedDateTimeFromSelf'
import { PaymentMethodSchema } from '@schemas/invoices/paymentMethod'
import { NonRecursiveBigDecimalSchema } from '@schemas/nonRecursiveBigDecimal'

export const InvoiceRefundFormSchema = Schema.Struct({
  amount: NonRecursiveBigDecimalSchema,

  method: Schema.NullOr(PaymentMethodSchema),

  completedAt: Schema.NullOr(ZonedDateTimeFromSelf),
})
export type InvoiceRefundForm = typeof InvoiceRefundFormSchema.Type
