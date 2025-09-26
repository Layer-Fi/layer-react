import { Schema, pipe } from 'effect'
import { ZonedDateTimeFromSelf } from '../../../utils/schema/utils'
import { LedgerEntryDirectionSchema, SingleChartAccountSchema } from '../../../schemas/generalLedger/ledgerAccount'
import { AccountIdentifierSchema } from '../../../schemas/accountIdentifier'
import { TagKeyValueSchema, TagSchema } from '../../../features/tags/tagSchemas'
import { CustomerSchema } from '../../../schemas/customer'
import { VendorSchema } from '../../../schemas/vendor'

export const JournalEntryFormLineItemSchema = Schema.Struct({
  externalId: Schema.NullOr(Schema.String),
  accountIdentifier: AccountIdentifierSchema,
  amount: Schema.BigDecimal,
  direction: LedgerEntryDirectionSchema,
  memo: Schema.NullOr(Schema.String),
  tags: Schema.Array(TagSchema),

  customer: Schema.NullOr(CustomerSchema),
  vendor: Schema.NullOr(VendorSchema),
})

// Main form schema (user-friendly representation)
export const JournalEntryFormSchema = Schema.Struct({
  externalId: Schema.NullOr(Schema.String), // Idempotency key
  entryAt: ZonedDateTimeFromSelf, // Changed from entry_at to camelCase
  createdBy: Schema.String,
  memo: Schema.String,
  tags: Schema.Array(TagSchema),
  metadata: Schema.NullOr(Schema.Unknown), // JSON format with 10KB limit
  referenceNumber: Schema.NullOr(Schema.String),
  lineItems: Schema.Array(JournalEntryFormLineItemSchema),

  customer: Schema.NullOr(CustomerSchema),
  vendor: Schema.NullOr(VendorSchema),
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
    Schema.propertySignature(Schema.Date),
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

// API Response Schemas (based on Kotlin data classes)

// ApiLineItem schema (matches Kotlin ApiLineItem data class)
export const ApiLineItemSchema = Schema.Struct({
  id: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('id'),
  ), // lineItemId in Kotlin
  entryId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entry_id'),
  ),
  account: SingleChartAccountSchema,
  amount: Schema.Number, // Long in Kotlin representing cents
  direction: LedgerEntryDirectionSchema,
  customer: Schema.NullOr(CustomerSchema), // ApiCustomerData
  vendor: Schema.NullOr(VendorSchema), // ApiVendorData
  entryAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('entry_at'),
  ),
  createdAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('createdAt'),
  ),
  entryReversalOf: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('entry_reversal_of'),
  ),
  entryReversedBy: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('entry_reversed_by'),
  ),
})

// ApiCustomJournalEntryLineItem response schema
export const ApiCustomJournalEntryLineItemSchema = Schema.Struct({
  id: Schema.UUID,
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  lineItemId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('line_item_id'),
  ),
  customer: Schema.NullOr(CustomerSchema),
  vendor: Schema.NullOr(VendorSchema),
  transactionTags: pipe(
    Schema.optional(Schema.Array(Schema.Unknown)),
    Schema.fromKey('transaction_tags'),
  ),
})

// ApiLedgerEntry response schema
export const ApiLedgerEntrySchema = Schema.Struct({
  entryId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('id'),
  ),
  businessId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('business_id'),
  ),
  ledgerId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('ledger_id'),
  ),
  entryNumber: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.Number)),
    Schema.fromKey('entry_number'),
  ),
  agent: Schema.NullOr(Schema.String), // ClassifierAgent
  entryType: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('entry_type'),
  ),
  customer: Schema.NullOr(Schema.Unknown), // ApiCustomerData
  vendor: Schema.NullOr(Schema.Unknown), // ApiVendorData
  createdAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('date'),
  ),
  entryAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('entry_at'),
  ),
  reversalOfId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('reversal_of_id'),
  ),
  reversalId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('reversal_id'),
  ),
  lineItems: pipe(
    Schema.propertySignature(Schema.Array(ApiLineItemSchema)),
    Schema.fromKey('line_items'),
  ),
  tags: Schema.Array(Schema.Unknown), // Deprecated field
  transactionTags: pipe(
    Schema.propertySignature(Schema.Array(Schema.Unknown)),
    Schema.fromKey('transaction_tags'),
  ),
  memo: Schema.NullOr(Schema.String),
  metadata: Schema.NullOr(Schema.Unknown),
  referenceNumber: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

// ApiCustomJournalEntryWithEntry response schema (main return type)
export const ApiCustomJournalEntryWithEntrySchema = Schema.Struct({
  id: Schema.UUID,
  externalId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  createdBy: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('created_by'),
  ),
  memo: Schema.String,
  entryId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('entry_id'),
  ),
  customer: Schema.NullOr(CustomerSchema), // ApiCustomerData
  vendor: Schema.NullOr(VendorSchema), // ApiVendorData
  lineItems: pipe(
    Schema.propertySignature(Schema.Array(ApiCustomJournalEntryLineItemSchema)),
    Schema.fromKey('line_items'),
  ),
  entry: ApiLedgerEntrySchema,
  transactionTags: pipe(
    Schema.propertySignature(Schema.Array(Schema.Unknown)),
    Schema.fromKey('transaction_tags'),
  ),
  metadata: Schema.NullOr(Schema.Unknown),
  referenceNumber: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

// Journal Entry Return Schema (replaces the old one)
export const JournalEntryReturnSchema = Schema.Struct({
  data: ApiCustomJournalEntryWithEntrySchema,
})

// Legacy schema for backward compatibility
export const UpsertJournalEntrySchema = CreateCustomJournalEntrySchema

export type CreateCustomJournalEntry = typeof CreateCustomJournalEntrySchema.Type
export type CreateCustomJournalEntryLineItem = typeof CreateCustomJournalEntryLineItemSchema.Type
export type UpsertJournalEntry = typeof UpsertJournalEntrySchema.Type
export type ApiLineItem = typeof ApiLineItemSchema.Type
export type ApiCustomJournalEntryLineItem = typeof ApiCustomJournalEntryLineItemSchema.Type
export type ApiLedgerEntry = typeof ApiLedgerEntrySchema.Type
export type ApiCustomJournalEntryWithEntry = typeof ApiCustomJournalEntryWithEntrySchema.Type
export type JournalEntryReturn = typeof JournalEntryReturnSchema.Type
