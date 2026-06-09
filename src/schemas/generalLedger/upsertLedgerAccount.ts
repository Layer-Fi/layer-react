import { pipe, Schema } from 'effect'

import { AccountIdSchema, StableNameSchema } from '@schemas/accountIdentifier'
import { LedgerAccountTypeSchema, LedgerEntryDirectionSchema } from '@schemas/generalLedger/ledgerAccount'

export const UpsertLedgerAccountSchema = Schema.Struct({
  name: Schema.String,
  accountNumber: Schema.optional(Schema.String).pipe(
    Schema.fromKey('account_number'),
  ),
  normality: LedgerEntryDirectionSchema,
  parentId: Schema.optional(AccountIdSchema).pipe(
    Schema.fromKey('parent_id'),
  ),
  accountType: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('account_type'),
  ),
  accountSubtype: Schema.optional(Schema.String).pipe(
    Schema.fromKey('account_subtype'),
  ),
  stableName: Schema.optional(StableNameSchema).pipe(
    Schema.fromKey('stable_name'),
  ),
})
export type UpsertLedgerAccount = typeof UpsertLedgerAccountSchema.Type

export const LedgerAccountFormSchema = Schema.Struct({
  parent: Schema.NullOr(Schema.String),
  name: Schema.String,
  accountNumber: Schema.String,
  type: Schema.NullOr(LedgerAccountTypeSchema),
  subType: Schema.NullOr(Schema.String),
  normality: Schema.NullOr(LedgerEntryDirectionSchema),
})
export type LedgerAccountForm = typeof LedgerAccountFormSchema.Type
