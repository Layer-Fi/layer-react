import { pipe, Schema } from 'effect'

import { BookkeepingStatus } from '@schemas/bookkeepingConfiguration'
import { createTransformedEnumSchema } from '@schemas/utils'

export { BookkeepingStatus }

const TransformedBookkeepingStatusSchema = createTransformedEnumSchema(
  Schema.Enums(BookkeepingStatus),
  BookkeepingStatus,
  BookkeepingStatus.NOT_PURCHASED,
)

const BookkeepingStatusDataSchema = Schema.Struct({
  status: TransformedBookkeepingStatusSchema,

  showEmbeddedOnboarding: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('show_embedded_onboarding'),
  ),

  onboardingCallUrl: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('onboarding_call_url'),
  ),
})

export type BookkeepingStatusData = typeof BookkeepingStatusDataSchema.Type

export const BookkeepingStatusResponseSchema = Schema.Struct({
  data: BookkeepingStatusDataSchema,
})

export type BookkeepingStatusResponse = typeof BookkeepingStatusResponseSchema.Type
