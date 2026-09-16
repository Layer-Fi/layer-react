import { pipe, Schema } from 'effect'

import { AccountIdentifierSchema } from '@schemas/common/accountIdentifier'
import { LedgerEntryDirectionSchema } from '@schemas/features/generalLedger/ledgerEntryDirection'
import { TagKeyValueSchema } from '@schemas/features/tags/tagKeyValue'

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

export const UpsertJournalEntrySchema = CreateCustomJournalEntrySchema

export type CreateCustomJournalEntry = typeof CreateCustomJournalEntrySchema.Type
export type CreateCustomJournalEntryLineItem = typeof CreateCustomJournalEntryLineItemSchema.Type
export type UpsertJournalEntry = typeof UpsertJournalEntrySchema.Type
