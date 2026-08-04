import { pipe, Schema } from 'effect'

import { UnwrappedDataResponseSchema } from '@schemas/utils'

export enum StripeAccountStatus {
  NotCreated = 'not_created',
  Incomplete = 'incomplete',
  Pending = 'pending',
  Active = 'active',
}

const StripeAccountStatusEnumSchema = Schema.Enums(StripeAccountStatus)

export const TransformedStripeAccountStatusSchema = Schema.transform(
  Schema.NonEmptyTrimmedString,
  Schema.typeSchema(StripeAccountStatusEnumSchema),
  {
    decode: (input) => {
      if (Object.values(StripeAccountStatusEnumSchema.enums).includes(input as StripeAccountStatus)) {
        return input as StripeAccountStatus
      }
      return StripeAccountStatus.NotCreated
    },
    encode: input => input,
  },
)

export const StripeAccountStatusDataSchema = Schema.Struct({
  accountStatus: pipe(
    Schema.propertySignature(TransformedStripeAccountStatusSchema),
    Schema.fromKey('account_status'),
  ),
})

export const StripeAccountStatusResponseSchema = UnwrappedDataResponseSchema(StripeAccountStatusDataSchema)
export type StripeAccountStatusResponse = typeof StripeAccountStatusDataSchema.Type
