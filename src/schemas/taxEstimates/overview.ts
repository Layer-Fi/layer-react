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
  color?: string | null
  key: TaxOverviewCategoryKey
  label: string
}

export type TaxOverviewDeadlineStatusKind = 'pastDue' | 'paid' | 'due' | 'categorizationIncomplete'

export type TaxOverviewDeadlineStatus = {
  kind: TaxOverviewDeadlineStatusKind
}

export type TaxOverviewDeadlineReview = {
  payload: {
    type: 'UNCATEGORIZED_TRANSACTIONS'
    count: number
    amount: number
  }
}

export type TaxOverviewDeadline = {
  amount: number
  description: string
  dueAt: Date
  id: string
  reviewAction?: TaxOverviewDeadlineReview
  status?: TaxOverviewDeadlineStatus
  title: string
}
