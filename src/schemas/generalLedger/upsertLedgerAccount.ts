import { pipe, Schema } from 'effect'

import { AccountIdSchema, StableNameSchema } from '@schemas/common/accountIdentifier'
import { LedgerEntryDirectionSchema } from '@schemas/generalLedger/ledgerEntryDirection'

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
