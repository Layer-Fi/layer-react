import { Schema, pipe } from 'effect'
import { LedgerEntryDirectionSchema, SingleChartAccountSchema } from '../../../schemas/generalLedger/ledgerAccount'
import { AccountIdentifierSchema } from '../../../schemas/accountIdentifier'
import { TagKeyValueSchema, TagSchema, TransactionTagSchema } from '../../../features/tags/tagSchemas'
import { CustomerSchema } from '../../../schemas/customer'
import { VendorSchema } from '../../../schemas/vendor'
import { ZonedDateTimeFromSelf } from '../../../schemas/common/zonedDateTimeFromSelf'

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

export const JournalEntryFormSchema = Schema.Struct({
  externalId: Schema.NullOr(Schema.String),
  entryAt: ZonedDateTimeFromSelf,
  createdBy: Schema.String,
  memo: Schema.String,
  tags: Schema.Array(TagSchema),
  metadata: Schema.NullOr(Schema.Unknown),
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

export const CreateCustomJournalEntryLineItemSchema = Schema.Struct({
  externalId: Schema.optional(Schema.String).pipe(
    Schema.fromKey('external_id'),
  ),
  accountIdentifier: pipe(
    Schema.propertySignature(AccountIdentifierSchema),
    Schema.fromKey('account_identifier'),
  ),
  amount: Schema.BigInt,
  direction: LedgerEntryDirectionSchema,
  memo: Schema.optional(Schema.String),
  customerId: Schema.optional(Schema.UUID).pipe(
    Schema.fromKey('customer_id'),
  ),
  customerExternalId: Schema.optional(Schema.String).pipe(
    Schema.fromKey('customer_external_id'),
  ),
  vendorId: Schema.optional(Schema.UUID).pipe(
    Schema.fromKey('vendor_id'),
  ),
  vendorExternalId: Schema.optional(Schema.String).pipe(
    Schema.fromKey('vendor_external_id'),
  ),
  tags: Schema.optional(Schema.Array(TagKeyValueSchema)),
})

export const CreateCustomJournalEntrySchema = Schema.Struct({
  externalId: Schema.optional(Schema.String).pipe(
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
  customerId: Schema.optional(Schema.UUID).pipe(
    Schema.fromKey('customer_id'),
  ),
  customerExternalId: Schema.optional(Schema.String).pipe(
    Schema.fromKey('customer_external_id'),
  ),
  vendorId: Schema.optional(Schema.UUID).pipe(
    Schema.fromKey('vendor_id'),
  ),
  vendorExternalId: Schema.optional(Schema.String).pipe(
    Schema.fromKey('vendor_external_id'),
  ),
  tags: Schema.optional(Schema.Array(TagKeyValueSchema)),
  metadata: Schema.optional(Schema.Unknown),
  referenceNumber: Schema.optional(Schema.String).pipe(
    Schema.fromKey('reference_number'),
  ),
  lineItems: pipe(
    Schema.propertySignature(Schema.Array(CreateCustomJournalEntryLineItemSchema)),
    Schema.fromKey('line_items'),
  ),
})

export const ApiLineItemSchema = Schema.Struct({
  id: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('id'),
  ),
  entryId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('entry_id'),
  ),
  account: SingleChartAccountSchema,
  amount: Schema.Number,
  direction: LedgerEntryDirectionSchema,
  customer: Schema.NullOr(CustomerSchema),
  vendor: Schema.NullOr(VendorSchema),
  entryAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('entry_at'),
  ),
  createdAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('createdAt'),
  ),
  entryReversalOf: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.UUID)),
    Schema.fromKey('entry_reversal_of'),
  ),
  entryReversedBy: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.UUID)),
    Schema.fromKey('entry_reversed_by'),
  ),
})

export const ApiCustomJournalEntryLineItemSchema = Schema.Struct({
  id: Schema.UUID,
  externalId: pipe(
    Schema.optional(Schema.NullOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  memo: Schema.optional(Schema.NullOr(Schema.String)),
  lineItemId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('line_item_id'),
  ),
  customer: Schema.NullOr(CustomerSchema),
  vendor: Schema.NullOr(VendorSchema),
  transactionTags: pipe(
    Schema.optional(Schema.Array(TransactionTagSchema)),
    Schema.fromKey('transaction_tags'),
  ),
})

export const ApiLedgerEntrySchema = Schema.Struct({
  entryId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('id'),
  ),
  businessId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('business_id'),
  ),
  ledgerId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('ledger_id'),
  ),
  entryNumber: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.Number)),
    Schema.fromKey('entry_number'),
  ),
  agent: Schema.NullOr(Schema.String),
  entryType: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('entry_type'),
  ),
  customer: Schema.NullOr(Schema.Unknown),
  vendor: Schema.NullOr(Schema.Unknown),
  createdAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('date'),
  ),
  entryAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('entry_at'),
  ),
  reversalOfId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.UUID)),
    Schema.fromKey('reversal_of_id'),
  ),
  reversalId: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.UUID)),
    Schema.fromKey('reversal_id'),
  ),
  lineItems: pipe(
    Schema.propertySignature(Schema.Array(ApiLineItemSchema)),
    Schema.fromKey('line_items'),
  ),
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
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('entry_id'),
  ),
  customer: Schema.NullOr(CustomerSchema),
  vendor: Schema.NullOr(VendorSchema),
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

export const JournalEntryReturnSchema = Schema.Struct({
  data: ApiCustomJournalEntryWithEntrySchema,
})

export const UpsertJournalEntrySchema = CreateCustomJournalEntrySchema

export type CreateCustomJournalEntry = typeof CreateCustomJournalEntrySchema.Type
export type CreateCustomJournalEntryLineItem = typeof CreateCustomJournalEntryLineItemSchema.Type
export type UpsertJournalEntry = typeof UpsertJournalEntrySchema.Type
export type ApiLineItem = typeof ApiLineItemSchema.Type
export type ApiCustomJournalEntryLineItem = typeof ApiCustomJournalEntryLineItemSchema.Type
export type ApiLedgerEntry = typeof ApiLedgerEntrySchema.Type
export type ApiCustomJournalEntryWithEntry = typeof ApiCustomJournalEntryWithEntrySchema.Type
export type JournalEntryReturn = typeof JournalEntryReturnSchema.Type
