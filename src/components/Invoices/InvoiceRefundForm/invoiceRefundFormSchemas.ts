import { Schema } from 'effect'

import { ZonedDateTimeFromSelf } from '@schemas/common/zonedDateTimeFromSelf'
import { NonRecursiveBigDecimalSchema } from '@schemas/nonRecursiveBigDecimal'
import { PaymentMethodSchema } from '@components/PaymentMethod/schemas'

export const InvoiceRefundFormSchema = Schema.Struct({
  amount: NonRecursiveBigDecimalSchema,

  method: Schema.NullOr(PaymentMethodSchema),

  completedAt: Schema.NullOr(ZonedDateTimeFromSelf),
})
export type InvoiceRefundForm = typeof InvoiceRefundFormSchema.Type
