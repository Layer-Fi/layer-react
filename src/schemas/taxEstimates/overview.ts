import { pipe, Schema } from 'effect'

const TaxOverviewApiDataSchema = Schema.Struct({
  year: Schema.Number,
  excludesPendingTransactions: pipe(
    Schema.propertySignature(Schema.NullishOr(Schema.Boolean)),
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
    Schema.propertySignature(Schema.NullishOr(Schema.Date)),
    Schema.fromKey('taxes_due_date'),
  ),
})

export type TaxOverviewApiData = typeof TaxOverviewApiDataSchema.Type

export const TaxOverviewApiResponseSchema = Schema.Struct({
  data: TaxOverviewApiDataSchema,
})

export type TaxOverviewApiResponse = typeof TaxOverviewApiResponseSchema.Type

export type TaxOverviewCategoryKey = 'federal' | 'state'

export type TaxOverviewCategory = {
  amount: number
  key: TaxOverviewCategoryKey
  label: string
}

export type TaxOverviewDeadlineStatusKind = 'pastDue' | 'paid' | 'due' | 'categorizationIncomplete'

export type TaxOverviewDeadlineStatus = {
  kind: TaxOverviewDeadlineStatusKind
}

export type TaxOverviewNextTax = {
  amount: number
  dueAt: Date
  quarter: number
  status: TaxOverviewDeadlineStatus
}

export type TaxOverviewData = {
  deductionsTotal: number
  estimatedTaxCategories: TaxOverviewCategory[]
  estimatedTaxesTitle: string
  estimatedTaxesTotal: number
  incomeTotal: number
  nextTax?: TaxOverviewNextTax
}
