import { pipe, Schema } from 'effect'

import { createTransformedEnumSchema } from '@schemas/common/utils'
import { BookkeepingStatus } from '@schemas/features/bookkeeping/bookkeepingConfiguration'

export { BookkeepingStatus }

const TransformedBookkeepingStatusSchema = createTransformedEnumSchema(
  Schema.Enums(BookkeepingStatus),
  BookkeepingStatus,
  BookkeepingStatus.NOT_PURCHASED,
)

export const BookkeepingStatusDataSchema = Schema.Struct({
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
