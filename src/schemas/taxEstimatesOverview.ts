import { pipe, Schema } from 'effect'

const ApiTaxOverviewSchema = Schema.Struct({
  year: Schema.Number,
  excludesPendingTransactions: pipe(
    Schema.propertySignature(Schema.Boolean),
    Schema.fromKey('excludes_pending_transactions'),
  ),
  taxableIncomeEstimate: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('taxable_income_estimate'),
  ),
  totalIncome: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('total_income'),
  ),
  totalDeductions: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('total_deductions'),
  ),
  estimatedTaxesOwed: pipe(
    Schema.propertySignature(Schema.Number),
    Schema.fromKey('estimated_taxes_owed'),
  ),
  taxesDueDate: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('taxes_due_date'),
  ),
})

export type ApiTaxOverview = typeof ApiTaxOverviewSchema.Type

export const TaxOverviewResponseSchema = Schema.Struct({
  data: ApiTaxOverviewSchema,
})

export type TaxOverviewResponse = typeof TaxOverviewResponseSchema.Type
