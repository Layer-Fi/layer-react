import { pipe, Schema } from 'effect'

import { TagDimensionSchema } from '@schemas/tag'

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

  enableCustomerManagement: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('enable_customer_management'),
  ),

  taxEstimatesUserAgreementAt: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Date)),
    Schema.fromKey('tax_estimates_user_agreement_at'),
  ),

  enableTaxEstimates: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('enable_tax_estimates'),
  ),

  enableMileageTracking: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('enable_mileage_tracking'),
  ),

  enableStripeOnboarding: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('enable_stripe_onboarding'),
  ),

  platformDisplayTags: pipe(
    Schema.propertySignature(Schema.Array(TagDimensionSchema)),
    Schema.fromKey('platform_display_tags'),
  ),
})

export type AccountingConfigurationSchemaType = typeof AccountingConfigurationSchema.Type
