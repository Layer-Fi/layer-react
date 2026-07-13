import { Schema } from 'effect'

import { InvoiceSchema } from '@schemas/invoices/invoice'
import { InvoicePaymentMethodsSchema } from '@schemas/invoices/invoicePaymentMethod'

export const FinalizeInvoiceBodySchema = Schema.extend(
  InvoicePaymentMethodsSchema,
  Schema.Struct({
    customPaymentInstructions: Schema.optional(Schema.String).pipe(
      Schema.fromKey('custom_payment_instructions'),
    ),
  }),
)

export type FinalizeInvoiceBody = typeof FinalizeInvoiceBodySchema.Type
export type FinalizeInvoiceBodyEncoded = typeof FinalizeInvoiceBodySchema.Encoded

export const FinalizeInvoiceDataSchema = Schema.extend(
  InvoicePaymentMethodsSchema,
  Schema.Struct({
    invoice: InvoiceSchema,
  }),
)
