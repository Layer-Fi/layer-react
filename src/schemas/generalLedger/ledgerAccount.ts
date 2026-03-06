import { pipe, Schema } from 'effect'

export const AccountTypeSchema = Schema.Struct({
  value: Schema.String,
  displayName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_name'),
  ),
})

export const AccountSubtypeSchema = Schema.Struct({
  value: Schema.String,
  displayName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_name'),
  ),
})

export const AccountSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  stableName: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.String)),
    Schema.fromKey('stable_name'),
  ),
  normality: Schema.String,
  accountType: pipe(
    Schema.propertySignature(AccountTypeSchema),
    Schema.fromKey('account_type'),
  ),
  accountSubtype: pipe(
    Schema.propertySignature(AccountSubtypeSchema),
    Schema.fromKey('account_subtype'),
  ),
})

export enum LedgerEntryDirection {
  Credit = 'CREDIT',
  Debit = 'DEBIT',
}
export const LedgerEntryDirectionSchema = Schema.Enums(LedgerEntryDirection)

export enum LedgerAccountType {
  Asset = 'ASSET',
  Liability = 'LIABILITY',
  Equity = 'EQUITY',
  Revenue = 'REVENUE',
  Expense = 'EXPENSE',
}
export const LedgerAccountTypeSchema = Schema.Enums(LedgerAccountType)

export const LedgerAccountTypeWithDisplayNameSchema = Schema.Struct({
  value: LedgerAccountTypeSchema,
  displayName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_name'),
  ),
})

export const LedgerAccountSubtypeWithDisplayNameSchema = Schema.Struct({
  value: Schema.String,
  displayName: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('display_name'),
  ),
})

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

const nestedLedgerAccountFields = {
  accountId: pipe(
    Schema.propertySignature(Schema.UUID),
    Schema.fromKey('id'),
  ),
  name: Schema.String,
  stableName: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('stable_name'),
  ),
  accountNumber: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
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
    Schema.propertySignature(Schema.NullOr(Schema.Boolean)),
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

const nestedChartAccountFields = {
  accountId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('id'),
  ),
  name: Schema.String,
  stableName: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
    Schema.fromKey('stable_name'),
  ),
  accountNumber: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.String)),
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

export type NestedLedgerAccountType = typeof NestedLedgerAccountSchema.Type
export type NestedChartAccountType = typeof NestedChartAccountSchema.Type
export type SingleChartAccountType = typeof SingleChartAccountSchema.Type
export type SingleChartAccountEncodedType = typeof SingleChartAccountSchema.Encoded

export const ChartOfAccountsSchema = Schema.Struct({
  accounts: Schema.Array(NestedChartAccountSchema),
})

export const LedgerBalancesSchema = Schema.Struct({
  accounts: Schema.Array(NestedLedgerAccountSchema),
})

export type LedgerBalancesSchemaType = typeof LedgerBalancesSchema.Type
