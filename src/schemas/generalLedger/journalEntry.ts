import { pipe, Schema } from 'effect'

import { CustomerSchema } from '@schemas/customerVendor/customer'
import { VendorSchema } from '@schemas/customerVendor/vendor'
import { SingleChartAccountSchema } from '@schemas/generalLedger/chartOfAccounts'
import { LedgerEntryDirectionSchema } from '@schemas/generalLedger/ledgerEntryDirection'
import { TransactionTagSchema } from '@schemas/tags/transactionTag'

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
  customer: Schema.NullishOr(CustomerSchema),
  vendor: Schema.NullishOr(VendorSchema),
  entryAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('entry_at'),
  ),
  createdAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('createdAt'),
  ),
  entryReversalOf: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.UUID)),
    Schema.fromKey('entry_reversal_of'),
  ),
  entryReversedBy: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.UUID)),
    Schema.fromKey('entry_reversed_by'),
  ),
})

export const ApiCustomJournalEntryLineItemSchema = Schema.Struct({
  id: Schema.UUID,
  externalId: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('external_id'),
  ),
  memo: Schema.NullishOr(Schema.String),
  lineItemId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('line_item_id'),
  ),
  customer: Schema.NullishOr(CustomerSchema),
  vendor: Schema.NullishOr(VendorSchema),
  transactionTags: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Array(TransactionTagSchema))),
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
    Schema.propertySignature(Schema.NullishOr(Schema.Number)),
    Schema.fromKey('entry_number'),
  ),
  agent: Schema.NullishOr(Schema.String),
  entryType: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('entry_type'),
  ),
  customer: Schema.NullishOr(Schema.Unknown),
  vendor: Schema.NullishOr(Schema.Unknown),
  createdAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('date'),
  ),
  entryAt: pipe(
    Schema.propertySignature(Schema.Date),
    Schema.fromKey('entry_at'),
  ),
  reversalOfId: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.UUID)),
    Schema.fromKey('reversal_of_id'),
  ),
  reversalId: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.UUID)),
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
  memo: Schema.NullishOr(Schema.String),
  metadata: Schema.NullishOr(Schema.Unknown),
  referenceNumber: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

export const ApiCustomJournalEntryWithEntrySchema = Schema.Struct({
  id: Schema.UUID,
  externalId: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
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
  customer: Schema.NullishOr(CustomerSchema),
  vendor: Schema.NullishOr(VendorSchema),
  lineItems: pipe(
    Schema.propertySignature(Schema.Array(ApiCustomJournalEntryLineItemSchema)),
    Schema.fromKey('line_items'),
  ),
  entry: ApiLedgerEntrySchema,
  transactionTags: pipe(
    Schema.propertySignature(Schema.Array(Schema.Unknown)),
    Schema.fromKey('transaction_tags'),
  ),
  metadata: Schema.NullishOr(Schema.Unknown),
  referenceNumber: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('reference_number'),
  ),
})

export const JournalEntryReturnSchema = Schema.Struct({
  data: ApiCustomJournalEntryWithEntrySchema,
})
export type ApiLineItem = typeof ApiLineItemSchema.Type
export type ApiCustomJournalEntryLineItem = typeof ApiCustomJournalEntryLineItemSchema.Type
export type ApiLedgerEntry = typeof ApiLedgerEntrySchema.Type
export type ApiCustomJournalEntryWithEntry = typeof ApiCustomJournalEntryWithEntrySchema.Type
export type JournalEntryReturn = typeof JournalEntryReturnSchema.Type
