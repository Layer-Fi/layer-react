import { pipe, Schema } from 'effect'

import { LedgerAccountSubtypeWithDisplayNameSchema, LedgerAccountTypeWithDisplayNameSchema } from '@schemas/features/generalLedger/ledgerAccountType'
import { LedgerEntryDirectionSchema } from '@schemas/features/generalLedger/ledgerEntryDirection'

const nestedLedgerAccountFields = {
  accountId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('id'),
  ),
  name: Schema.String,
  stableName: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('stable_name'),
  ),
  accountNumber: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('account_number'),
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
  balance: Schema.Number,
  isDeletable: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Boolean)),
    Schema.fromKey('is_deletable'),
  ),
}

export interface NestedLedgerAccount extends Schema.Struct.Type<typeof nestedLedgerAccountFields> {
  subAccounts: ReadonlyArray<NestedLedgerAccount>
}

export interface NestedLedgerAccountEncoded extends Schema.Struct.Encoded<typeof nestedLedgerAccountFields> {
  readonly sub_accounts: ReadonlyArray<NestedLedgerAccountEncoded>
}

export const NestedLedgerAccountSchema = Schema.Struct({
  ...nestedLedgerAccountFields,
  subAccounts: pipe(
    Schema.propertySignature(Schema.Array(
      Schema.suspend((): Schema.Schema<NestedLedgerAccount, NestedLedgerAccountEncoded> => NestedLedgerAccountSchema),
    )),
    Schema.fromKey('sub_accounts'),
  ),
})

export type NestedLedgerAccountType = typeof NestedLedgerAccountSchema.Type

export const LedgerBalancesSchema = Schema.Struct({
  accounts: Schema.Array(NestedLedgerAccountSchema),
})

export type LedgerBalancesSchemaType = typeof LedgerBalancesSchema.Type
