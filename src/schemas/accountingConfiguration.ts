import { Schema, pipe } from 'effect'

export enum ReportingBasis {
  Accrual = 'ACCRUAL',
  Cash = 'CASH',
  DeprecatedCash = 'DEPRECATED_CASH',
  MoneyMovementOnly = 'MONEY_MOVEMENT_ONLY',
}
export const ReportingBasisSchema = Schema.Enums(ReportingBasis)

export enum AccountingConfigurationCategoryListMode {
  AllAccounts = 'ALL_ACCOUNTS',
  RevenuesAndExpenses = 'REVENUES_AND_EXPENSES',
}
export const CategoryListModeSchema = Schema.Enums(AccountingConfigurationCategoryListMode)

export const AccountingConfigurationSchema = Schema.Struct({
  id: Schema.UUID,

  enableAccountNumbers: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('enable_account_numbers'),
  ),
})

export type AccountingConfigurationSchemaType = typeof AccountingConfigurationSchema.Type
