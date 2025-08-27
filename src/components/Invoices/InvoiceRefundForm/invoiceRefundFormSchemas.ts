import { Schema } from 'effect'
import { ZonedDateTimeFromSelf } from '../../../utils/schema/utils'
import { PaymentMethodSchema } from '../../../components/PaymentMethod/schemas'

export const InvoiceRefundFormSchema = Schema.Struct({
  amount: Schema.BigDecimal,

  method: Schema.NullOr(PaymentMethodSchema),

  completedAt: Schema.NullOr(ZonedDateTimeFromSelf),
})
export type InvoiceRefundForm = typeof InvoiceRefundFormSchema.Type
