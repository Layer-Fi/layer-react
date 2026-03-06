import { pipe, Schema } from 'effect'

export enum InvoicePaymentMethod {
  ACH = 'ACH',
  CreditCard = 'CREDIT_CARD',
  Unknown = 'UNKNOWN',
}

export const InvoicePaymentMethodTypeSchema = Schema.Enums(InvoicePaymentMethod)

export const TransformedInvoicePaymentMethodSchema = Schema.transform(
  Schema.NonEmptyTrimmedString,
  Schema.typeSchema(InvoicePaymentMethodTypeSchema),
  {
    decode: (input) => {
      if (Object.values(InvoicePaymentMethodTypeSchema.enums).includes(input as InvoicePaymentMethod)) {
        return input as InvoicePaymentMethod
      }
      return InvoicePaymentMethod.Unknown
    },
    encode: input => input,
  },
)

export const InvoicePaymentMethodsSchema = Schema.Struct({
  paymentMethods: pipe(
    Schema.propertySignature(Schema.Array(TransformedInvoicePaymentMethodSchema)),
    Schema.fromKey('payment_methods'),
  ),
})
export type InvoicePaymentMethods = typeof InvoicePaymentMethodsSchema.Type
export type InvoicePaymentMethodsEncoded = typeof InvoicePaymentMethodsSchema.Encoded
export const InvoicePaymentMethodsResponseSchema = Schema.Struct({
  data: InvoicePaymentMethodsSchema,
})
export type InvoicePaymentMethodsResponse = typeof InvoicePaymentMethodsResponseSchema.Type
