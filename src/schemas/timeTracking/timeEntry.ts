import { pipe, Schema } from 'effect'

import { CalendarDateSchema } from '@schemas/common/calendarDateFromSelf'
import { CustomerSchema } from '@schemas/customerVendor/customer'
import { TimeEntryServiceSchema } from '@schemas/timeTracking/timeEntryService'

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
