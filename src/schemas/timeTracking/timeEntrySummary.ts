import { pipe, Schema } from 'effect'

export const TimeEntrySummaryGroupSchema = Schema.Struct({
  id: Schema.NullishOr(Schema.UUID),

  name: Schema.String,

  totalMinutes: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('total_minutes'),
  ),

  totalBillableMinutes: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('total_billable_minutes'),
  ),

  totalBillableAmount: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('total_billable_amount'),
  ),

  entryCount: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('entry_count'),
  ),
})
export type TimeEntrySummaryGroup = typeof TimeEntrySummaryGroupSchema.Type

export const TimeEntrySummarySchema = Schema.Struct({
  totalMinutes: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('total_minutes'),
  ),

  totalBillableMinutes: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('total_billable_minutes'),
  ),

  totalBillableAmount: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('total_billable_amount'),
  ),

  byService: pipe(
    Schema.propertySignature(Schema.Array(TimeEntrySummaryGroupSchema)),
    Schema.fromKey('by_service'),
  ),
})
export type TimeEntrySummary = typeof TimeEntrySummarySchema.Type
