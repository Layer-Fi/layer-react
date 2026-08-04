import { Schema } from 'effect'

import { LedgerAccountTypeSchema } from '@schemas/generalLedger/ledgerAccountType'
import { LedgerEntryDirectionSchema } from '@schemas/generalLedger/ledgerEntryDirection'

export const LedgerAccountFormSchema = Schema.Struct({
  parent: Schema.NullOr(Schema.String),
  name: Schema.String,
  accountNumber: Schema.String,
  type: Schema.NullOr(LedgerAccountTypeSchema),
  subType: Schema.NullOr(Schema.String),
  normality: Schema.NullOr(LedgerEntryDirectionSchema),
})
export type LedgerAccountForm = typeof LedgerAccountFormSchema.Type
