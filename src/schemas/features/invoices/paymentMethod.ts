import { Schema } from 'effect'

export enum PaymentMethod {
  Cash = 'CASH',
  Check = 'CHECK',
  CreditCard = 'CREDIT_CARD',
  Ach = 'ACH',
  Other = 'Other',
}
export const PaymentMethodSchema = Schema.Enums(PaymentMethod)

export const TransformedPaymentMethodSchema = Schema.transform(
  Schema.NonEmptyTrimmedString,
  Schema.typeSchema(PaymentMethodSchema),
  {
    decode: (input) => {
      if (Object.values(PaymentMethodSchema.enums).includes(input as PaymentMethod)) {
        return input as PaymentMethod
      }
      return PaymentMethod.Other
    },
    encode: input => input,
  },
)
