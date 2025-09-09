import { Schema, pipe } from 'effect'
import { CustomerSchema } from '../customer'
import { VendorSchema } from '../vendor'
import { TagSchema, TagKeyValueSchema } from '../tag'
import { AccountIdentifierSchema, LedgerEntryDirectionSchema } from './ledgerAccount'
import { LedgerEntrySchema } from './ledgerEntry'
import { ZonedDateTimeFromSelf } from '../../utils/schema/utils'

export const CreateCustomJournalEntryLineItemSchema = Schema.Struct({
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  accountIdentifier: pipe(
    Schema.propertySignature(AccountIdentifierSchema),
    Schema.fromKey('account_identifier'),
  ),
  amount: Schema.Number,
  direction: LedgerEntryDirectionSchema,
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  customerId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('customer_id'),
  ),
  customerExternalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('customer_external_id'),
  ),
  vendorId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('vendor_id'),
  ),
  vendorExternalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('vendor_external_id'),
  ),
  tagKeyValues: pipe(
    Schema.optional(Schema.Array(TagKeyValueSchema)),
    Schema.fromKey('tags'),
  ),
})

export type CreateCustomJournalEntryLineItem = Schema.Schema.Type<typeof CreateCustomJournalEntryLineItemSchema>

export const CreateCustomJournalEntrySchema = Schema.Struct({
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  entryAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('entry_at'),
  ),
  createdBy: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('created_by'),
  ),
  memo: Schema.String,
  lineItems: pipe(
    Schema.propertySignature(Schema.mutable(Schema.Array(CreateCustomJournalEntryLineItemSchema))),
    Schema.fromKey('line_items'),
  ),
  tagKeyValues: pipe(
    Schema.optional(Schema.Array(TagKeyValueSchema)),
    Schema.fromKey('tags'),
  ),
  customerId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('customer_id'),
  ),
  customerExternalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('customer_external_id'),
  ),
  vendorId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('vendor_id'),
  ),
  vendorExternalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('vendor_external_id'),
  ),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

export type CreateCustomJournalEntry = Schema.Schema.Type<typeof CreateCustomJournalEntrySchema>

export const CreateCustomJournalEntriesSchema = Schema.Struct({
  entries: Schema.Array(CreateCustomJournalEntrySchema),
})

export type CreateCustomJournalEntries = Schema.Schema.Type<typeof CreateCustomJournalEntriesSchema>

export const CustomJournalEntryLineItemSchema = Schema.Struct({
  id: Schema.String,
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  lineItemId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('line_item_id'),
  ),
  customer: Schema.optional(Schema.NullOr(CustomerSchema)),
  vendor: Schema.optional(Schema.NullOr(VendorSchema)),
  transactionTags: pipe(
    Schema.optional(Schema.Array(TagSchema)),
    Schema.fromKey('transaction_tags'),
  ),
})

export type CustomJournalEntryLineItem = Schema.Schema.Type<typeof CustomJournalEntryLineItemSchema>

export const CustomJournalEntrySchema = Schema.Struct({
  id: Schema.String,
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
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
  customer: Schema.optional(Schema.NullOr(CustomerSchema)),
  vendor: Schema.optional(Schema.NullOr(VendorSchema)),
  lineItems: pipe(
    Schema.propertySignature(Schema.Array(CustomJournalEntryLineItemSchema)),
    Schema.fromKey('line_items'),
  ),
  transactionTags: pipe(
    Schema.propertySignature(Schema.Array(TagSchema)),
    Schema.fromKey('transaction_tags'),
  ),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

export type CustomJournalEntry = Schema.Schema.Type<typeof CustomJournalEntrySchema>

export const CustomJournalEntryWithEntrySchema = Schema.Struct({
  id: Schema.String,
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
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
  customer: Schema.optional(Schema.NullOr(CustomerSchema)),
  vendor: Schema.optional(Schema.NullOr(VendorSchema)),
  lineItems: pipe(
    Schema.propertySignature(Schema.Array(CustomJournalEntryLineItemSchema)),
    Schema.fromKey('line_items'),
  ),
  entry: LedgerEntrySchema,
  transactionTags: pipe(
    Schema.propertySignature(Schema.Array(TagSchema)),
    Schema.fromKey('transaction_tags'),
  ),
  metadata: Schema.optional(Schema.NullOr(Schema.Unknown)),
  referenceNumber: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

export type CustomJournalEntryWithEntry = Schema.Schema.Type<typeof CustomJournalEntryWithEntrySchema>

export const CustomJournalEntriesSchema = Schema.Struct({
  entries: Schema.Array(CustomJournalEntryWithEntrySchema),
})

export type CustomJournalEntries = Schema.Schema.Type<typeof CustomJournalEntriesSchema>

// Form schemas for the custom journal entry form
export const CustomJournalEntryFormLineItemSchema = Schema.Struct({
  accountIdentifier: Schema.optional(Schema.NullOr(AccountIdentifierSchema)),
  amount: Schema.BigDecimal,
  direction: LedgerEntryDirectionSchema,
  memo: Schema.optional(Schema.String),
  customer: Schema.optional(Schema.NullOr(CustomerSchema)),
  vendor: Schema.optional(Schema.NullOr(VendorSchema)),
  tagKeyValues: Schema.optional(Schema.Array(TagKeyValueSchema)),
})

export type CustomJournalEntryFormLineItem = Schema.Schema.Type<typeof CustomJournalEntryFormLineItemSchema>

export const CustomJournalEntryFormSchema = Schema.Struct({
  entryAt: ZonedDateTimeFromSelf,
  memo: Schema.String,
  lineItems: Schema.mutable(Schema.Array(CustomJournalEntryFormLineItemSchema)),
  customer: Schema.optional(Schema.NullOr(CustomerSchema)),
  vendor: Schema.optional(Schema.NullOr(VendorSchema)),
  tagKeyValues: Schema.optional(Schema.Array(TagKeyValueSchema)),
  referenceNumber: Schema.optional(Schema.String),
})

export type CustomJournalEntryForm = Schema.Schema.Type<typeof CustomJournalEntryFormSchema>
