import { Schema, pipe } from 'effect'
import { ZonedDateTimeFromSelf } from '../../../utils/schema/utils'
import { LedgerEntryDirectionSchema } from '../../../schemas/generalLedger/ledgerAccount'
import { AccountIdentifierSchema } from '../../../schemas/accountIdentifier'
import { TagKeyValueSchema, TagSchema } from '../../../features/tags/tagSchemas'

export const JournalEntryFormLineItemSchema = Schema.Struct({
  externalId: Schema.NullOr(Schema.String),
  accountIdentifier: AccountIdentifierSchema,
  amount: Schema.BigDecimal,
  direction: LedgerEntryDirectionSchema,
  memo: Schema.NullOr(Schema.String),
  tags: Schema.Array(TagSchema),

  customerId: Schema.NullOr(Schema.String),
  customerExternalId: Schema.NullOr(Schema.String),
  vendorId: Schema.NullOr(Schema.String),
  vendorExternalId: Schema.NullOr(Schema.String),
})

// Main form schema (user-friendly representation)
export const JournalEntryFormSchema = Schema.Struct({
  externalId: Schema.NullOr(Schema.String), // Idempotency key
  entryAt: Schema.NullOr(ZonedDateTimeFromSelf), // Changed from entry_at to camelCase
  createdBy: Schema.String,
  memo: Schema.String,
  tags: Schema.Array(TagSchema),
  metadata: Schema.NullOr(Schema.Unknown), // JSON format with 10KB limit
  referenceNumber: Schema.NullOr(Schema.String),
  lineItems: Schema.Array(JournalEntryFormLineItemSchema),

  customerId: Schema.NullOr(Schema.String),
  customerExternalId: Schema.NullOr(Schema.String),
  vendorId: Schema.NullOr(Schema.String),
  vendorExternalId: Schema.NullOr(Schema.String),
})

export type JournalEntryFormLineItem = typeof JournalEntryFormLineItemSchema.Type
export type JournalEntryForm = Omit<typeof JournalEntryFormSchema.Type, 'lineItems'> & {
  // Purposefully allow lineItems to be mutable for `field.pushValue` in the form
  lineItems: JournalEntryFormLineItem[]
}

// API Line Item Schema (matches OpenAPI CreateCustomJournalEntryLineItem)
export const CreateCustomJournalEntryLineItemSchema = Schema.Struct({
  externalId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  accountIdentifier: pipe(
    Schema.propertySignature(AccountIdentifierSchema),
    Schema.fromKey('account_identifier'),
  ),
  amount: Schema.BigInt, // int64 format representing cents
  direction: LedgerEntryDirectionSchema,
  memo: Schema.NullOr(Schema.String),
  customerId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('customer_id'),
  ),
  customerExternalId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('customer_external_id'),
  ),
  vendorId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('vendor_id'),
  ),
  vendorExternalId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('vendor_external_id'),
  ),
  tags: Schema.Array(TagKeyValueSchema),
})

// API Schema for submission (matches OpenAPI CreateCustomJournalEntry)
export const CreateCustomJournalEntrySchema = Schema.Struct({
  externalId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ), // Idempotency key
  entryAt: pipe(
    Schema.propertySignature(ZonedDateTimeFromSelf),
    Schema.fromKey('entry_at'),
  ), // date-time format
  createdBy: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('created_by'),
  ), // Required
  memo: Schema.String, // Required
  customerId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('customer_id'),
  ),
  customerExternalId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('customer_external_id'),
  ),
  vendorId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('vendor_id'),
  ),
  vendorExternalId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('vendor_external_id'),
  ),
  tags: Schema.Array(TagKeyValueSchema),
  metadata: Schema.NullOr(Schema.Unknown), // JSON format with 10KB limit
  referenceNumber: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
  lineItems: pipe(
    Schema.propertySignature(Schema.Array(CreateCustomJournalEntryLineItemSchema)),
    Schema.fromKey('line_items'),
  ), // Required
})

// Legacy schema for backward compatibility
export const UpsertJournalEntrySchema = CreateCustomJournalEntrySchema

export type CreateCustomJournalEntry = typeof CreateCustomJournalEntrySchema.Type
export type CreateCustomJournalEntryLineItem = typeof CreateCustomJournalEntryLineItemSchema.Type
export type UpsertJournalEntry = typeof UpsertJournalEntrySchema.Type
