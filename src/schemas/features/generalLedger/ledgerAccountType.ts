import { pipe, Schema } from 'effect'

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
