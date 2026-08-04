import { pipe, Schema } from 'effect'

import { LedgerAccountSubtypeWithDisplayNameSchema, LedgerAccountTypeWithDisplayNameSchema } from '@schemas/generalLedger/ledgerAccountType'
import { LedgerEntryDirectionSchema } from '@schemas/generalLedger/ledgerEntryDirection'

const nestedChartAccountFields = {
  accountId: pipe(
    Schema.propertySignature(Schema.String),
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
}

export interface NestedChartAccount extends Schema.Struct.Type<typeof nestedChartAccountFields> {
  subAccounts: ReadonlyArray<NestedChartAccount>
}

export interface NestedChartAccountEncoded extends Schema.Struct.Encoded<typeof nestedChartAccountFields> {
  readonly sub_accounts: ReadonlyArray<NestedChartAccountEncoded>
}

export const SingleChartAccountSchema = Schema.Struct(nestedChartAccountFields)

export const NestedChartAccountSchema = Schema.Struct({
  ...nestedChartAccountFields,
  subAccounts: pipe(
    Schema.propertySignature(Schema.Array(
      Schema.suspend((): Schema.Schema<NestedChartAccount, NestedChartAccountEncoded> => NestedChartAccountSchema),
    )),
    Schema.fromKey('sub_accounts'),
  ),
})

export type NestedChartAccountType = typeof NestedChartAccountSchema.Type
export type SingleChartAccountType = typeof SingleChartAccountSchema.Type
export type SingleChartAccountEncodedType = typeof SingleChartAccountSchema.Encoded

export const ChartOfAccountsSchema = Schema.Struct({
  accounts: Schema.Array(NestedChartAccountSchema),
})
