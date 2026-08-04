import { pipe, Schema } from 'effect'

import { LedgerAccountSubtypeWithDisplayNameSchema, LedgerAccountTypeWithDisplayNameSchema } from '@schemas/generalLedger/ledgerAccountType'
import { LedgerEntryDirectionSchema } from '@schemas/generalLedger/ledgerEntryDirection'

export const LedgerAccountSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  stableName: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('stable_name'),
  ),
  normality: LedgerEntryDirectionSchema,
  accountType: pipe(
    Schema.propertySignature(LedgerAccountTypeWithDisplayNameSchema),
    Schema.fromKey('account_type'),
  ),
  accountSubtype: pipe(
    Schema.propertySignature(LedgerAccountSubtypeWithDisplayNameSchema),
    Schema.fromKey('account_subtype'),
  ),
})
export type LedgerAccount = typeof LedgerAccountSchema.Type
