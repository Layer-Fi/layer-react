import { Schema } from 'effect'

import { NonRecursiveBigDecimalSchema } from '@schemas/common/nonRecursiveBigDecimal'
import { ZonedDateTimeFromSelf } from '@schemas/common/zonedDateTimeFromSelf'
import { PaymentMethodSchema } from '@schemas/features/invoices/paymentMethod'

export const InvoiceRefundFormSchema = Schema.Struct({
  amount: NonRecursiveBigDecimalSchema,

  method: Schema.NullOr(PaymentMethodSchema),

  completedAt: Schema.NullOr(ZonedDateTimeFromSelf),
})
export type InvoiceRefundForm = typeof InvoiceRefundFormSchema.Type
