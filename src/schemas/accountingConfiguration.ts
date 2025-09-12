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
  defaultReportingBasis: pipe(
    Schema.propertySignature(Schema.NullOr(ReportingBasisSchema)),
    Schema.fromKey('default_reporting_basis'),
  ),
  categoryListMode: pipe(
    Schema.propertySignature(Schema.NullOr(CategoryListModeSchema)),
    Schema.fromKey('category_list_mode'),
  ),
  matchRoundingThreshold: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.Number)),
    Schema.fromKey('match_rounding_threshold'),
  ),
  matchAdjustmentThreshold: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.Number)),
    Schema.fromKey('match_adjustment_threshold'),
  ),
  disableAdjustmentMatchSuggestions: pipe(
    Schema.propertySignature(Schema.NullOr(Schema.Boolean)),
    Schema.fromKey('disable_adjustment_match_suggestions'),
  ),
  enableAccountNumbers: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('enable_account_numbers'),
  ),
})

export type AccountingConfigurationSchemaType = typeof AccountingConfigurationSchema.Type
