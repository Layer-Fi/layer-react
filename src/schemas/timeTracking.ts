import { pipe, Schema } from 'effect'

import { CustomerSchema } from '@schemas/customer'

import { CalendarDateFromSelf, CalendarDateSchema } from './common/calendarDateFromSelf'

export const TimeEntryServiceSchema = Schema.Struct({
  id: Schema.UUID,

  name: Schema.NullishOr(Schema.String),

  billableRatePerHourAmount: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('billable_rate_per_hour_amount'),
  ),
})
export type TimeEntryService = typeof TimeEntryServiceSchema.Type

export const TimeEntryInvoiceLineItemSchema = Schema.Struct({
  id: Schema.UUID,

  invoiceId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('invoice_id'),
  ),
})
export type TimeEntryInvoiceLineItem = typeof TimeEntryInvoiceLineItemSchema.Type

export const TimeEntryStatusSchema = Schema.Literal('ACTIVE', 'COMPLETED', 'RECORDED')
export type TimeEntryStatus = typeof TimeEntryStatusSchema.Type

export const TimeEntrySchema = Schema.Struct({
  id: Schema.UUID,

  businessId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('business_id'),
  ),

  externalId: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),

  date: CalendarDateSchema,

  durationMinutes: pipe(
    Schema.propertySignature(Schema.Int),
    Schema.fromKey('duration_minutes'),
  ),

  billable: Schema.Boolean,

  description: Schema.NullishOr(Schema.String),

  memo: Schema.NullishOr(Schema.String),

  metadata: Schema.NullishOr(Schema.Unknown),

  customer: Schema.NullishOr(CustomerSchema),

  service: Schema.NullishOr(TimeEntryServiceSchema),

  invoiceLineItem: pipe(
    Schema.propertySignature(Schema.NullishOr(TimeEntryInvoiceLineItemSchema)),
    Schema.fromKey('invoice_line_item'),
  ),

  status: Schema.optional(TimeEntryStatusSchema),

  stoppedAt: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Date)),
    Schema.fromKey('stopped_at'),
  ),

  createdAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('created_at'),
  ),

  updatedAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('updated_at'),
  ),

  deletedAt: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Date)),
    Schema.fromKey('deleted_at'),
  ),
})

export type TimeEntry = typeof TimeEntrySchema.Type
export type TimeEntryEncoded = typeof TimeEntrySchema.Encoded

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
    Schema.propertySignature(Schema.Array(Schema.Unknown)),
    Schema.fromKey('by_service'),
  ),
})
export type TimeEntrySummary = typeof TimeEntrySummarySchema.Type

export const TimeEntryFormSchema = Schema.Struct({
  date: Schema.NullOr(CalendarDateFromSelf),
  durationMinutes: Schema.Number,
  memo: Schema.String,
  customerId: Schema.NullOr(Schema.String),
  serviceId: Schema.String,
})

export type TimeEntryForm = typeof TimeEntryFormSchema.Type

export const UpsertTimeEntrySchema = Schema.Struct({
  externalId: Schema.optional(Schema.String).pipe(
    Schema.fromKey('external_id'),
  ),

  date: CalendarDateSchema,

  durationMinutes: pipe(
    Schema.propertySignature(Schema.Int),
    Schema.fromKey('duration_minutes'),
  ),

  billable: Schema.Boolean,

  description: Schema.NullishOr(Schema.String),

  memo: Schema.NullishOr(Schema.String),

  metadata: Schema.NullishOr(Schema.Unknown),

  customerId: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.UUID)),
    Schema.fromKey('customer_id'),
  ),

  serviceId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('service_id'),
  ),
})

export const StartTrackerSchema = Schema.Struct({
  serviceId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('service_id'),
  ),

  customerId: Schema.optional(Schema.UUID).pipe(
    Schema.fromKey('customer_id'),
  ),

  customerExternalId: Schema.optional(Schema.String).pipe(
    Schema.fromKey('customer_external_id'),
  ),

  billable: Schema.optional(Schema.Boolean),

  description: Schema.NullishOr(Schema.String),

  memo: Schema.NullishOr(Schema.String),

  metadata: Schema.NullishOr(Schema.Unknown),
})

export type UpsertTimeEntry = typeof UpsertTimeEntrySchema.Type
export type UpsertTimeEntryEncoded = typeof UpsertTimeEntrySchema.Encoded

export type StartTracker = typeof StartTrackerSchema.Type
export type StartTrackerEncoded = typeof StartTrackerSchema.Encoded
