import { pipe, Schema } from 'effect'

export const TimeEntryServiceSchema = Schema.Struct({
  id: Schema.UUID,

  name: Schema.NullishOr(Schema.String),

  billableRatePerHourAmount: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('billable_rate_per_hour_amount'),
  ),
})
export type TimeEntryService = typeof TimeEntryServiceSchema.Type
