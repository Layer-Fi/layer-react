import { pipe, Schema } from 'effect'

export enum InvoicePaymentMethodType {
  ACH = 'ACH',
  CreditCard = 'CREDIT_CARD',
}

export const InvoicePaymentMethodTypeSchema = Schema.Enums(InvoicePaymentMethodType)

export const InvoicePaymentMethodsDataSchema = Schema.Struct({
  type: Schema.String,
  paymentMethods: pipe(
    Schema.propertySignature(Schema.Array(InvoicePaymentMethodTypeSchema)),
    Schema.fromKey('payment_methods'),
  ),
})
export type InvoicePaymentMethodsData = typeof InvoicePaymentMethodsDataSchema.Type

export const InvoicePaymentMethodsResponseSchema = Schema.Struct({
  data: InvoicePaymentMethodsDataSchema,
})
export type InvoicePaymentMethodsResponse = typeof InvoicePaymentMethodsResponseSchema.Type
